package com.researchspace.webapp.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.axiope.search.SearchUtils;
import com.researchspace.core.util.SearchResultsImpl;
import com.researchspace.core.util.SortOrder;
import com.researchspace.model.PaginationCriteria;
import com.researchspace.model.User;
import com.researchspace.model.dtos.WorkspaceFilters;
import com.researchspace.model.record.BaseRecord;
import com.researchspace.service.RecordManager;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.ui.ExtendedModelMap;

class WorkspaceHomeTest {
  @Test
  void onlyBareWorkspaceOpensHomeSoExistingDeepLinksKeepTheirState() {
    assertTrue(WorkspaceController.isHomeRequest(new MockHttpServletRequest()));
    for (String parameter :
        List.of("view", "settingsKey", "favoritesFilter", "sharedFilter", "pageNumber")) {
      var request = new MockHttpServletRequest();
      request.addParameter(parameter, "value");
      assertFalse(WorkspaceController.isHomeRequest(request), parameter);
    }
  }

  @Test
  void recentDocumentsUseExistingUserScopedServiceAndBoundedDescendingResults() {
    var records = mock(RecordManager.class);
    var user = new User();
    var controller = new WorkspaceController();
    ReflectionTestUtils.setField(controller, "recordManager", records);
    when(records.getFilteredRecords(any(), any(), same(user)))
        .thenReturn(new SearchResultsImpl<BaseRecord>(List.of(), 0, 0));
    var model = new ExtendedModelMap();
    controller.addHomeAttributes(model, user);
    var filters = ArgumentCaptor.forClass(WorkspaceFilters.class);
    var pagination = ArgumentCaptor.forClass(PaginationCriteria.class);
    verify(records).getFilteredRecords(filters.capture(), pagination.capture(), same(user));
    assertTrue(filters.getValue().isViewableItemsFilter());
    assertTrue(filters.getValue().isDocumentsFilter());
    assertEquals(6, pagination.getValue().getResultsPerPage());
    assertEquals(SortOrder.DESC, pagination.getValue().getSortOrder());
    assertEquals(
        SearchUtils.BASE_RECORD_ORDER_BY_LAST_MODIFIED, pagination.getValue().getOrderBy());
    assertEquals(true, model.get("workspaceHome"));
    assertEquals(List.of(), model.get("homeRecentRecords"));
  }

  @Test
  void collectionLinksDoNotOverrideSavedWorkspaceState() {
    var request = new MockHttpServletRequest();
    request.addParameter("section", "notebooks");
    request.addParameter("homePage", "1");
    assertTrue(WorkspaceController.isHomeRequest(request));
    request.addParameter("settingsKey", "saved");
    assertFalse(WorkspaceController.isHomeRequest(request));
  }

  @Test
  void collectionFiltersBeforePaginationAndClampsOutOfRangePages() {
    var records = mock(RecordManager.class);
    var user = new User();
    var controller = new WorkspaceController();
    ReflectionTestUtils.setField(controller, "recordManager", records);
    var accessible = new java.util.ArrayList<BaseRecord>();
    for (long id = 1; id <= 14; id++) {
      BaseRecord notebook = mock(BaseRecord.class);
      when(notebook.isNotebook()).thenReturn(true);
      when(notebook.getModificationDate()).thenReturn(id);
      accessible.add(notebook);
    }
    BaseRecord document = mock(BaseRecord.class);
    when(document.isStructuredDocument()).thenReturn(true);
    accessible.add(document);
    when(records.getFilteredRecordsList(any(), same(user))).thenReturn(accessible);
    var model = new ExtendedModelMap();
    controller.addHomeCollection(model, user, "notebooks", "999999999999");
    assertEquals(1, model.get("homeCurrentPage"));
    assertEquals(false, model.get("homeHasNext"));
    assertEquals(List.of(accessible.get(1), accessible.get(0)), model.get("homeRecentRecords"));
    controller.addHomeCollection(model, user, "notebooks", "invalid");
    assertEquals(0, model.get("homeCurrentPage"));
    assertEquals(true, model.get("homeHasNext"));
    controller.addHomeCollection(model, user, "documents", "-1");
    assertEquals(List.of(document), model.get("homeRecentRecords"));
  }
}
