// src/layout/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-neutral-50">
            {/* Header */}
            <Header />

            {/* Body avec Sidebar et Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet /> {/* Dynamic content from child routes */}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default MainLayout;