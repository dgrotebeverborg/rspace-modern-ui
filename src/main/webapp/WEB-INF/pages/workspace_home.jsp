<%@ include file="/common/taglibs.jsp"%>
<nav class="home-destinations" aria-label="<spring:message code='workspace:home.shortcuts'/>">
  <a class="home-destination" href="/workspace?section=notebooks" aria-current="${homeSection eq 'notebooks' ? 'page' : 'false'}">
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 8h13l3 3 3-3h13v32H27l-3 3-3-3H8zM24 11v32M13 16h6M13 22h6M29 16h6M29 22h6"/></svg>
    <strong><spring:message code="workspace:home.notebooks" /></strong><span><spring:message code="workspace:home.notebooksHint" /></span>
  </a>
  <a class="home-destination" href="/workspace?section=documents" aria-current="${homeSection eq 'documents' ? 'page' : 'false'}">
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 6h17l9 9v27H12zM29 6v10h9M18 24h14M18 30h14M18 36h8"/></svg>
    <strong><spring:message code="workspace:home.documents" /></strong><span><spring:message code="workspace:home.documentsHint" /></span>
  </a>
  <a class="home-destination" href="/gallery">
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 13V9h14l5 5h19v26H5zM5 20h38M12 34l7-8 6 6 5-5 7 7"/></svg>
    <strong><spring:message code="workspace:home.media" /></strong><span><spring:message code="workspace:home.mediaHint" /></span>
  </a>
  <c:if test="${homeInventoryAvailable}">
  <a class="home-destination" href="/inventory">
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 7h10v27a5 5 0 0 1-10 0zM30 7h10v27a5 5 0 0 1-10 0zM8 21h10M30 21h10M6 7h14M28 7h14M13 27v2M35 27v2"/></svg>
    <strong><spring:message code="common:appBar.sections.inventory.title" /></strong><span><spring:message code="workspace:home.inventoryHint" /></span>
  </a>
  </c:if>
</nav>
<section class="home-secondary" aria-label="<spring:message code='workspace:home.shortcuts'/>">
  <a class="home-secondary-link" href="/workspace?view=files&amp;currentViewMode=LIST_VIEW&amp;favoritesFilter=true">
    
    <span><strong><spring:message code="workspace:home.favorites" /></strong></span>
    
  </a>
  <a class="home-secondary-link" href="/workspace?view=files&amp;currentViewMode=LIST_VIEW&amp;sharedFilter=true">
    
    <span><strong><spring:message code="workspace:home.shared" /></strong></span>
    
  </a>
  <a class="home-secondary-link" href="/workspace?view=files&amp;currentViewMode=LIST_VIEW&amp;templatesFilter=true">
    
    <span><strong><spring:message code="workspace:home.templates" /></strong></span>
    
  </a>
</section>
<div class="home-columns">
  <section class="home-recent" aria-labelledby="home-recent-title">
    <div class="home-section-heading">
      <div><h2 id="home-recent-title"><c:choose><c:when test="${homeSection eq 'notebooks'}"><spring:message code="workspace:home.notebooks" /></c:when><c:when test="${homeSection eq 'documents'}"><spring:message code="workspace:home.documents" /></c:when><c:otherwise><spring:message code="workspace:home.recent" /></c:otherwise></c:choose></h2>
      <p><c:choose><c:when test="${empty homeSection}"><spring:message code="workspace:home.recentHint" /></c:when><c:otherwise><spring:message code="workspace:home.collectionHint" /></c:otherwise></c:choose></p></div>
      <c:if test="${empty homeSection}"><a href="/workspace?section=documents"><spring:message code="workspace:home.viewAll" /> <span aria-hidden="true">→</span></a></c:if>
    </div>
    <c:choose>
      <c:when test="${empty homeRecentRecords}">
        <div class="home-empty"><h3><spring:message code="workspace:home.emptyTitle" /></h3><p><spring:message code="workspace:home.emptyHint" /></p></div>
      </c:when>
      <c:otherwise>
        <ul class="home-records">
          <c:forEach items="${homeRecentRecords}" var="recent">
            <li><a href="/globalId/${recent.globalIdentifier}">
              <span class="home-document-icon" aria-hidden="true">▤</span>
              <span class="home-record-name"><strong><c:out value="${recent.name}" /></strong>
                <span><c:choose><c:when test="${recent.notebook}"><spring:message code="workspace:home.notebook" /></c:when><c:when test="${recent.template}"><spring:message code="workspace:home.template" /></c:when><c:otherwise><spring:message code="workspace:home.document" /></c:otherwise></c:choose> · <c:out value="${recent.owner.fullName}" /></span>
              </span>
              <span class="home-record-id"><fmt:formatDate value="${recent.modificationDateAsDate}" dateStyle="medium" /></span>
              <span aria-hidden="true">→</span>
            </a></li>
          </c:forEach>
        </ul>
      </c:otherwise>
    </c:choose>
    <c:if test="${not empty homeSection}">
      <nav class="home-pagination" aria-label="<spring:message code='workspace:home.pages'/>">
        <c:if test="${homeCurrentPage gt 0}"><a href="/workspace?section=${homeSection}&amp;homePage=${homeCurrentPage - 1}">← <spring:message code="workspace:home.previous" /></a></c:if>
        <c:if test="${homeHasNext}"><a href="/workspace?section=${homeSection}&amp;homePage=${homeCurrentPage + 1}"><spring:message code="workspace:home.next" /> →</a></c:if>
      </nav>
    </c:if>
  </section>
  <details class="home-help"><summary><spring:message code="workspace:home.help" /></summary>
  <aside class="home-guide" aria-labelledby="home-guide-title">
    <span class="home-eyebrow"><spring:message code="workspace:home.guideLabel" /></span>
    <h2 id="home-guide-title"><spring:message code="workspace:home.guideTitle" /></h2>
    <p><spring:message code="workspace:home.guideIntro" /></p>
    <dl>
      <div><dt><spring:message code="workspace:home.document" /></dt><dd><spring:message code="workspace:home.documentHint" /></dd></div>
      <div><dt><spring:message code="workspace:home.notebook" /></dt><dd><spring:message code="workspace:home.notebookHint" /></dd></div>
      <div><dt><spring:message code="workspace:home.folder" /></dt><dd><spring:message code="workspace:home.folderHint" /></dd></div>
    </dl>
    <p class="home-guide-footer"><spring:message code="workspace:home.createHint" /></p>
  </aside>
  </details>
</div>
