import { Routes } from '@angular/router';

export const PartialLayoutRoutes: Routes = [
  { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule), data: { title: 'Dashboard' } },
  { path: 'tracking', loadChildren: () => import('../../partial/tracking/tracking.module').then(m => m.TrackingModule), data: { title: 'Tracking' } },
  { path: 'register-vehicle', loadChildren: () => import('../../partial/register-vehicle/register-vehicle.module').then(m => m.RegisterVehicleModule), data: { title: 'Register Vehicle' } },
  { path: 'manage-vehicle', loadChildren: () => import('../../partial/manage-vehicle/manage-vehicle.module').then(m => m.ManageVehicleModule), data: { title: 'Manage Vehicle' } },
  { path: 'driver', loadChildren: () => import('../../partial/driver/driver.module').then(m => m.DriverModule), data: { title: 'Drivers' } },
  { path: 'geofence', loadChildren: () => import('../../partial/geofence/geofence.module').then(m => m.GeofenceModule), data: { title: 'Geofence' } },
  { path: 'payment', loadChildren: () => import('../../partial/payment/payment.module').then(m => m.PaymentModule), data: { title: 'Payments' } },
  { path: 'reports', loadChildren: () => import('../../partial/reports/reports.module').then(m => m.ReportsModule), data: { title: 'Reports' } },
  { path: 'user-management-system', loadChildren: () => import('../../partial/user-management-system/user-management-system.module').then(m => m.UserManagementSystemModule), data: { title: 'User Management System' } },
  { path: 'settings', loadChildren: () => import('../../partial/settings/settings.module').then(m => m.SettingsModule), data: { title: 'Settings' } },
  { path: 'notifications', loadChildren: () => import('../../partial/notifications/notifications.module').then(m => m.NotificationsModule), data: { title: 'Notifications' } },
  // { path: 'my-profile', loadChildren: () => import('../../partial/my-profile/my-profile.module').then(m => m.MyProfileModule), data: { title: 'My Profile' } },
{path:'my-profile',loadChildren:()=>import('../../partial/my-profile/my-profile.module').then(m=>m.MyProfileModule),data:{title:'My Profile'}}
];
