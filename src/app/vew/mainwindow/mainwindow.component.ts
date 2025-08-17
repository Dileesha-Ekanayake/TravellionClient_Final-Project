import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from "@angular/router";
import {MatToolbar, MatToolbarRow} from "@angular/material/toolbar";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatListItem, MatNavList} from "@angular/material/list";
import {AuthorizationManagerService} from "../../auth/authorization-manager.service";
import {NgClass, NgOptimizedImage} from "@angular/common";
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {HoverExpandDirective} from "./hover-expand.directive";
import {OperationFeedbackService} from "../../util/core-services/feedback/operationfeedback.service";
import {StorageLockService} from "../../auth/storage-lock.service";
import {AvNotificationService} from "@avoraui/av-notifications";

@Component({
  selector: 'app-mainwindow',
  imports: [
    RouterOutlet,
    MatToolbar,
    MatToolbarRow,
    MatMenu,
    MatIcon,
    MatMenuTrigger,
    MatIconButton,
    MatSidenavContainer,
    MatSidenav,
    MatNavList,
    MatListItem,
    NgClass,
    MatExpansionPanel,
    RouterLink,
    MatSidenavContent,
    MatExpansionPanelHeader,
    NgOptimizedImage,
    HoverExpandDirective,
    MatButton,
  ],
  templateUrl: './mainwindow.component.html',
  standalone: true,
  styleUrl: './mainwindow.component.css'
})
export class MainwindowComponent implements OnInit {

  private readonly localStorageSelectedMenus = 'selectedMenu';

  opened = true;
  selectedMenuItem: string = '';
  selectedMainMenuItem: string = '';
  menuGroup: any[] = [];

  // Set Mat icons you need to add to Menus
  mainMenuIcons: any = {
    'Admin': 'manage_accounts',
    'Supplier': 'domain',
    'Location': 'location_city',
    'Configuration': 'table_chart',
    'Contract': 'assignment',
    'Bookings': 'book',
    'Payment': 'payment',
  };

  subMenuIcons: any = {
    'Employee': 'person',
    'User': 'supervisor_account',
    'Privilege': 'admin_panel_settings',
    'Operation': 'settings_applications',
    'Supplier': 'handshake',
    'Accommodation': 'hotel',
    'Transfer': 'commute',
    'Generic': 'map',
    'Setup Details': 'list_alt',
    'Location': 'location_on',
    'City': 'location_city',
    'Client': 'people',
    'Package': 'card_travel',
    'Booking': 'add_circle',
    'Client Payment': 'account_balance_wallet',
    'Supplier Payment': 'receipt_long',
  }

  constructor(
    public authService: AuthorizationManagerService,
    private router: Router,
    private avNotificationService: AvNotificationService,
    private operationFeedBackService: OperationFeedbackService,
    private storageLockService: StorageLockService,
  ) {
    this.selectedMenuItem = 'dashboard';
  }

  /**
   * Initializes the component after Angular has set up the data-bound properties and injected dependencies.
   * This method is invoked automatically when the component is initialized.
   * Performs initial setup tasks such as setting the default selected menu item, decrypting stored information from local storage,
   * fetching the user's menu group, and retrieving authentication details for the current user.
   *
   * @return {void} This method does not return a value.
   */
  ngOnInit(): void {

    //@ts-ignore
    const encryptedMenu = localStorage.getItem(this.localStorageSelectedMenus);

    if (encryptedMenu) {
      this.selectedMenuItem = this.storageLockService.decrypt(encryptedMenu);
      this.router.navigateByUrl(`Home/${this.selectedMenuItem.toLowerCase()}`);
    } else {
      this.selectedMenuItem = 'dashboard';
    }

    this.menuGroup = this.authService.getNavListItem();
    this.authService.getAuth(this.authService.getUsername());
  }

  // Check that the logged user has the permission to view and then set Visible menu or else set not-visible menu
  /**
   * Determines whether the menu associated with the specified category is visible.
   *
   * @param {string} category - The category of the menu to check for visibility.
   * @return {boolean} True if the menu is visible, otherwise false.
   */
  isMenuVisible(category: string): boolean {
    let isVisible = true;

    this.menuGroup.forEach((menuGroup: { Menu: string; MenuItems: { name: string; isVisible: boolean }[] }) => {

      if (menuGroup.Menu === category) {
        isVisible = menuGroup.MenuItems.some(menuItem => menuItem.isVisible);
      }
    });

    return isVisible;
  }

  /**
   * Selects a menu item, stores it in local storage after encryption, and updates the selected menu item property.
   *
   * @param {string} menuItem - The name or identifier of the menu item to be selected.
   * @return {void} This method does not return a value.
   */
  selectMenuItem(menuItem: string): void {
    //@ts-ignore
    localStorage.setItem(this.localStorageSelectedMenus, this.storageLockService.encrypt(menuItem));
    this.selectedMenuItem = menuItem;
  }

  /**
   * Logs the user out of the application by displaying a confirmation prompt.
   * If the user confirms, the logout process is initiated.
   *
   * @return {void} No return value.
   */
  logout(): void {

    this.operationFeedBackService.showConfirmation('', 'Log Out', "Are you sure to log out ?", {
      yes: 'Log Out',
      no: 'Stay Logged In'
    }).subscribe({
      next: (isConfirmed: boolean) => {
        if (!isConfirmed) {
          return;
        }
        this.authService.logout();
      }
    })
  }

  /**
   * Loads the employee profile from local storage and navigates to the user profile page if employee data is available.
   * If no employee data is found, displays a failure notification.
   * @return {void} Does not return a value.
   */
  loadProfile(): void {
    const loggedEmployee = localStorage.getItem('employee');
    if (loggedEmployee == undefined || loggedEmployee == '') {
      this.avNotificationService.showFailure("No employee data found!", {
        theme: "light"
      })
    } else {
      this.router.navigateByUrl('Home/user-profile');
    }
  }
}
