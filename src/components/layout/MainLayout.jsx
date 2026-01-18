import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, usePreferences } from '../../store/hooks';
import { loadPreferences } from '../../store/slices/preferencesSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import FooterPlayer from './FooterPlayer';

import QueueDrawer from './QueueDrawer';

export default function MainLayout({ children }) {
    const dispatch = useAppDispatch();
    const { selectedLanguages } = usePreferences();

    // Load preferences from localStorage on mount
    useEffect(() => {
        dispatch(loadPreferences());
    }, [dispatch]);

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen w-full text-slate-900 dark:text-slate-100 p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-hidden transition-colors duration-300">
            <div className="flex flex-1 gap-4 md:gap-6 max-w-[1800px] mx-auto w-full min-h-0">
                <Sidebar />
                <main className="flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden relative rounded-2xl">
                    <Header />
                    {children ? children : <Outlet context={{ selectedLanguages }} />}
                </main>
                <QueueDrawer />
            </div>
            <FooterPlayer />
        </div>
    );
}
