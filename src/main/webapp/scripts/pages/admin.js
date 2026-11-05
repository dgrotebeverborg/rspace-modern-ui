var tableElement = ".mainTable tbody";

$(document).ready(function (){
  const myRSpaceNavigation = document.getElementById("myrspace-navigation");
  if (myRSpaceNavigation) {
    const smallScreen = window.matchMedia("(max-width: 767px)");
    const updateNavigationLayout = () => { myRSpaceNavigation.open = !smallScreen.matches; };
    updateNavigationLayout();
    smallScreen.addEventListener("change", updateNavigationLayout);
    // The React app bar is mounted directly under body after window.load.
    const banners = document.querySelector(".header-wrapper");
    const observeAppBar = () => {
      const appBar = document.querySelector("body > #app-bar");
      if (!appBar) return false;
      const updateHeaderHeight = () => {
        const appBarHeight = appBar.getBoundingClientRect().height;
        document.documentElement.style.setProperty("--myrspace-appbar-height", appBarHeight + "px");
        document.documentElement.style.setProperty("--myrspace-header-height",
          (appBarHeight + (banners?.getBoundingClientRect().height || 0)) + "px");
      };
      const resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(appBar);
      if (banners) resizeObserver.observe(banners);
      updateHeaderHeight();
      return true;
    };
    if (!observeAppBar()) {
      const mountObserver = new MutationObserver(() => {
        if (observeAppBar()) mountObserver.disconnect();
      });
      mountObserver.observe(document.body, { childList: true });
    }
    myRSpaceNavigation.querySelector(".currentPanel a")?.setAttribute("aria-current", "page");
  }
	// this input field will only be available in cloud version
	applyAutocomplete('.user_autocompletable');

	let menuScrollTarget = null;
	let menuScrollTargetResetTimer = null;

	const getMenuScrollPositions = (menuFixer) => {
		const maxScrollLeft = menuFixer.scrollWidth - menuFixer.clientWidth;
		const panels = Array.from(document.querySelectorAll("#menuMover .menuInnerPanel"))
			.filter((panel) => panel.offsetParent !== null);
		const firstPanelOffset = panels[0]?.offsetLeft ?? 0;
		const positions = panels
			.map((panel) => Math.min(maxScrollLeft, Math.max(0, panel.offsetLeft - firstPanelOffset)));
		return positions.filter((position, index) =>
			index === 0 || Math.abs(position - positions[index - 1]) > 1);
	};

	const scrollCurrentMenuPanelIntoView = () => {
		const currentPanel = document.querySelector("#menuMover .menuInnerPanel.currentPanel");
		if (currentPanel !== null && currentPanel.offsetParent !== null) {
      if (myRSpaceNavigation) {
        const sidebar = document.getElementById("menuScrollContainer");
        if (myRSpaceNavigation.open && sidebar) {
          const panelBounds = currentPanel.getBoundingClientRect();
          const sidebarBounds = sidebar.getBoundingClientRect();
          if (panelBounds.bottom > sidebarBounds.bottom) sidebar.scrollTop += panelBounds.bottom - sidebarBounds.bottom;
        }
      } else {
        currentPanel.scrollIntoView({ block: "nearest", inline: "center" });
      }
			updateMenuScrollButtons();
		}
	};

	function updateMenuScrollButtons() {
		const menuFixer = document.querySelector("#menuFixer");
		if (menuFixer === null) {
			return;
		}
		const currentPosition = menuScrollTarget ?? menuFixer.scrollLeft;
		const scrollPositions = getMenuScrollPositions(menuFixer);
		const leftScroller = document.querySelector(".leftScroller");
		const rightScroller = document.querySelector(".rightScroller");
		if (leftScroller !== null) {
			leftScroller.style.display =
				scrollPositions.some((position) => position < currentPosition - 1) ? "" : "none";
		}
		if (rightScroller !== null) {
			rightScroller.style.display =
				scrollPositions.some((position) => position > currentPosition + 1) ? "" : "none";
		}
	}

	const scrollMenu = (direction) => {
		const menuFixer = document.querySelector("#menuFixer");
		if (menuFixer === null) {
			return;
		}
		const currentPosition = menuScrollTarget ?? menuFixer.scrollLeft;
		const panelPositions = getMenuScrollPositions(menuFixer);
		const targetPosition = direction > 0
			? panelPositions.find((position) => position > currentPosition + 1)
			: panelPositions.slice().reverse().find((position) => position < currentPosition - 1);
		if (targetPosition === undefined) {
			return;
		}
		menuScrollTarget = targetPosition;
		menuFixer.scrollTo({
			left: targetPosition
		});
		updateMenuScrollButtons();
		requestAnimationFrame(updateMenuScrollButtons);
		setTimeout(updateMenuScrollButtons, 150);
	};

	$('#createFormLink').click (function (e){
		e.preventDefault();
		var form$=$(this).closest('form');
		form$.submit();
	});
	const piCanCreateLabGroupsReq = $.get("/deploymentproperties/ajax/editableProperties");
	piCanCreateLabGroupsReq.done(function (resp) {
		const piCanCreateLabGroups = resp["self_service_labgroups"];
		if (piCanCreateLabGroups !== 'ALLOWED') {
			$('#self_service_labgroups').hide();
		}
		scrollCurrentMenuPanelIntoView();
	});

	const allowProjectGroupsReq = $.get("/deploymentproperties/ajax/editableProperties");
	allowProjectGroupsReq.done((resp) => {
	    const allowProjectGroups = resp["allow_project_groups"];
	    if (allowProjectGroups !== 'ALLOWED') {
	        $('#new_project_group').hide();
	    }
	    scrollCurrentMenuPanelIntoView();
	});

	var paginationEventHandler = function(source, e) {
		RS.blockPage(RS.msg("legacyjs.common.loadingChosenPage"), false, $(tableElement));
		let url = createURL(source.attr('id').split("_").slice(1).join("_"));
		if (RS.webResultCache.get(url) != undefined) {
			$('#directoryContainer').html(RS.webResultCache.get(url));
			RS.unblockPage($(tableElement));
		} else {
			var jxqr = $.get(url, function(data) {
				$('#directoryContainer').html(data);
				RS.webResultCache.put(url, data, 30 * 1000 );//30 seconds
				RS.unblockPage($(tableElement));
			});
			jxqr.fail(function() {
				RS.unblockPage($(tableElement));
				RS.ajaxFailed(RS.msg("legacyjs.admin.gettingUserActivity"), false, jxqr);
			});
		}
	};

	document.querySelector(".leftScroller")?.addEventListener("click", () => scrollMenu(-1));
	document.querySelector(".rightScroller")?.addEventListener("click", () => scrollMenu(1));
	document.querySelector("#menuFixer")?.addEventListener("scroll", () => {
		updateMenuScrollButtons();
		clearTimeout(menuScrollTargetResetTimer);
		menuScrollTargetResetTimer = setTimeout(() => {
			menuScrollTarget = null;
			updateMenuScrollButtons();
		}, 200);
	});
	window.addEventListener("resize", () => {
		menuScrollTarget = null;
		updateMenuScrollButtons();
	});
	setTimeout(scrollCurrentMenuPanelIntoView, 0);
	updateMenuScrollButtons();
	RS.setupPagination(paginationEventHandler);
});
