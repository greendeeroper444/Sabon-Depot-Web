import React, { useState } from 'react'
import '../../CSS/AdminCSS/AdminSettings.css';
import StaffGeneralComponent from '../../components/StaffComponents/StaffSettings/StaffGeneralComponent';
import StaffNotificationsComponent from '../../components/StaffComponents/StaffSettings/StaffNotificationsComponent';
import StaffOrderingComponent from '../../components/StaffComponents/StaffSettings/StaffOrderingComponent';

function StaffSettingsPage() {
    const [activeTab, setActiveTab] = useState('General');

    const tabs = [
        { id: 'General', icon: '⚙️', hasNotifications: false },
        { id: 'Notifications', icon: '🔔', hasNotifications: true, count: 3 },
        { id: 'Ordering', icon: '🛒', hasNotifications: false }
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'General':
                return <StaffGeneralComponent />;
            case 'Notifications':
                return <StaffNotificationsComponent />;
            case 'Ordering':
                return <StaffOrderingComponent />;
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

export default StaffSettingsPage;