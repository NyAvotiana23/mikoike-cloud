// src/components/Footer.jsx
import { HeartIcon } from '@heroicons/react/24/solid';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-neutral-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    {/* Copyright */}
                    <div className="flex items-center space-x-2 text-body-sm text-neutral-600">
                        <span>© {currentYear} MonApp.</span>
                        <span>Tous droits réservés.</span>
                    </div>

                    {/* Made with love */}
                    <div className="flex items-center space-x-1 text-body-sm text-neutral-600">
                        <span>Fait avec React Js</span>

                        <span>à Madagascar</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center space-x-6 text-body-sm">
                        <a
                            href="/privacy"
                            className="text-neutral-600 hover:text-primary-600 transition-colors"
                        >
                            Confidentialité
                        </a>
                        <a
                            href="/terms"
                            className="text-neutral-600 hover:text-primary-600 transition-colors"
                        >
                            Conditions
                        </a>
                        <a
                            href="/contact"
                            className="text-neutral-600 hover:text-primary-600 transition-colors"
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;