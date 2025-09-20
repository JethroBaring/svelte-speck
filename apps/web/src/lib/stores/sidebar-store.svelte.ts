import { getContext, setContext } from 'svelte';

export class SidebarState {
	isExpanded: boolean = $state(true);
  isMobileOpen: boolean = $state(false);
  isMobile: boolean = $state(false);
  isHovered: boolean = $state(false);
  activeItem: string | null = $state(null);
  openSubmenu: string | null = $state(null);

	constructor() {
    $effect(() => {
      const handleResize = () => {
        const mobile = window.innerWidth < 768;
        this.isMobile = mobile;
        if (!mobile) {
          this.isMobileOpen = false;
        }
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    });
  }

  toggleSidebar = () => {
    this.isExpanded = !this.isExpanded;
  };

  toggleMobileSidebar = () => {
    this.isMobileOpen = !this.isMobileOpen;
  };

  toggleSubmenu = (item: string) => {
    if (this.openSubmenu) {
      this.openSubmenu = (this.openSubmenu === item) ? null : item;
    }
  };

  setIsHovered = (value: boolean) => {
    this.isHovered = value;
  };
  
  setActiveItem = (item: string | null) => {
    if (this.activeItem) {
      this.activeItem = item;
    }
  };
}

const SIDEBAR_KEY = Symbol('SIDEBAR');

export function setSidebarState() {
	return setContext(SIDEBAR_KEY, new SidebarState());
}

export function getSidebarState() {
	return getContext<ReturnType<typeof setSidebarState>>(SIDEBAR_KEY);
}