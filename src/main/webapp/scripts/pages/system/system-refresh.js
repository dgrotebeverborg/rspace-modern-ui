$(function () {
  const navigation = document.getElementById("system-navigation");
  if (!navigation) return;
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=device-width, initial-scale=1";
    document.head.appendChild(viewport);
  }
  const mobile = window.matchMedia("(max-width: 767px)");
  const updateLayout = () => { navigation.open = !mobile.matches; };
  updateLayout();
  mobile.addEventListener("change", updateLayout);

  // The React app bar mounts directly under body after the window load event.
  const observeHeader = () => {
    const appBar = document.querySelector("body > #app-bar");
    if (!appBar) return false;
    const banners = document.querySelector(".header-wrapper");
    const updateHeight = () => {
      const height = appBar.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--system-appbar-height", height + "px");
      document.documentElement.style.setProperty("--system-header-height",
        (height + (banners?.getBoundingClientRect().height || 0)) + "px");
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(appBar);
    if (banners) observer.observe(banners);
    updateHeight();
    return true;
  };
  if (!observeHeader()) {
    const observer = new MutationObserver(() => {
      if (observeHeader()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true });
  }

  const path = window.location.pathname;
  const activeId = path.startsWith("/system/config") ? "configLink"
    : path.startsWith("/system/support") ? "supportLink"
    : path.startsWith("/system/createAccount") ? "createAccountLink"
    : path.startsWith("/system/groups") ? "listGroupButton"
    : /\/(community|createCommunity)/.test(path) ? "listCommunityButton"
    : path.startsWith("/record/share/published") ? "unpublishButton"
    : path === "/system" || path === "/system/" ? "listUsersButton" : null;
  if (activeId) document.getElementById(activeId)?.setAttribute("aria-current", "page");
});
