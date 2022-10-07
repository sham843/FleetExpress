import { Routes } from '@angular/router';
import { ExpenseGuard } from 'src/app/auth/expense.guard';

export const PartialLayoutRoutes: Routes = [
  { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule), data: { title: 'Dashboard' }, canActivate: [ExpenseGuard] },
  { path: 'tracking', loadChildren: () => import('../../partial/tracking/tracking.module').then(m => m.TrackingModule), data: { title: 'Tracking' }, canActivate: [ExpenseGuard] },
  { path: 'register-vehicle', loadChildren: () => import('../../partial/register-vehicle/register-vehicle.module').then(m => m.RegisterVehicleModule), data: { title: 'Register Vehicle' }, canActivate: [ExpenseGuard] },
  { path: 'manage-vehicle', loadChildren: () => import('../../partial/manage-vehicle/manage-vehicle.module').then(m => m.ManageVehicleModule), data: { title: 'Manage Vehicle' }, canActivate: [ExpenseGuard] },
  { path: 'driver', loadChildren: () => import('../../partial/driver/driver.module').then(m => m.DriverModule), data: { title: 'Driver' }, canActivate: [ExpenseGuard] },
  { path: 'geofence', loadChildren: () => import('../../partial/geofence/geofence.module').then(m => m.GeofenceModule), data: { title: 'Geofence' }, canActivate: [ExpenseGuard] },
  { path: 'payment', loadChildren: () => import('../../partial/payment/payment.module').then(m => m.PaymentModule), data: { title: 'Payment' }, canActivate: [ExpenseGuard] },
  { path: 'reports', loadChildren: () => import('../../partial/reports/reports.module').then(m => m.ReportsModule), data: { title: 'Reports' }, canActivate: [ExpenseGuard] },
  { path: 'user-management-system', loadChildren: () => import('../../partial/user-management-system/user-management-system.module').then(m => m.UserManagementSystemModule), data: { title: 'User Management System' }, canActivate: [ExpenseGuard] },
  { path: 'settings', loadChildren: () => import('../../partial/settings/settings.module').then(m => m.SettingsModule), data: { title: 'Settings' }, canActivate: [ExpenseGuard] },
  { path: 'notifications', loadChildren: () => import('../../partial/notifications/notifications.module').then(m => m.NotificationsModule), data: { title: 'Notifications' }, canActivate: [ExpenseGuard] },
  { path: 'my-profile', loadChildren: () => import('../../partial/my-profile/my-profile.module').then(m => m.MyProfileModule), data: { title: 'My Profile' }, canActivate: [ExpenseGuard] }
];
