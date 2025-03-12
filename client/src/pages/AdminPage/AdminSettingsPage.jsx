import React, { useState } from 'react'
import '../../CSS/AdminCSS/AdminSettings.css';
import AdminOrderingComponent from '../../components/AdminComponents/AdminSettings/AdminOrderingComponent';
import AdminGeneralComponent from '../../components/AdminComponents/AdminSettings/AdminGeneralComponent';
import AdminNotificationsComponent from '../../components/AdminComponents/AdminSettings/AdminNotificationsComponent';
import AdminPromotionsComponent from '../../components/AdminComponents/AdminSettings/AdminPromotionsComponent';
import AdminInventoryComponent from '../../components/AdminComponents/AdminSettings/AdminInventoryComponent';
import AdminUserRolesComponent from '../../components/AdminComponents/AdminSettings/AdminUserRolesComponent';

function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('General');

    const tabs = [
        { id: 'General', icon: '⚙️', hasNotifications: false },
        { id: 'Notifications', icon: '🔔', hasNotifications: true, count: 3 },
        { id: 'Promotions', icon: '🏷️', hasNotifications: false },
        { id: 'Inventory', icon: '📦', hasNotifications: false },
        { id: 'User Roles', icon: '👥', hasNotifications: false },
        { id: 'Ordering', icon: '🛒', hasNotifications: false }
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'General':
                return <AdminGeneralComponent />;
            case 'Notifications':
                return <AdminNotificationsComponent />;
            case 'Promotions':
                return <AdminPromotionsComponent />;
            case 'Inventory':
                return <AdminInventoryComponent />;
            case 'User Roles':
                return <AdminUserRolesComponent />;
            case 'Ordering':
                return <AdminOrderingComponent />;
            default:
                return <div className='settings-empty-state'>Select a tab to view its content</div>;
        }
    };

    return (
        <div className='settings-page-container'>
            <div className='settings-header'>
                <h1>{activeTab} Settings</h1>
                <p className='settings-breadcrumbs'>Dashboard / Settings / {activeTab}</p>
            </div>
            
            <div className='settings-tabs-wrapper'>
                <div className='settings-tabs'>
                    {
                        tabs.map((tab) => (
                            <div
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'settings-tab-active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className='settings-tab-icon'>{tab.icon}</span>
                                <span className='settings-tab-text'>{tab.id}</span>
                                {
                                    tab.hasNotifications && (
                                        <span className='settings-notification-badge' data-count={tab.count}>
                                            {tab.count}
                                        </span>
                                    )
                                }
                            </div>
                        ))
                    }
                </div>
                
                <div className='settings-tab-content'>
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
}

export default AdminSettingsPage;