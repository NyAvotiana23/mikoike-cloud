import { MapPin, Construction, Info, ArrowRight } from 'lucide-react';

function Home() {
    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            <div className="bg-white border-b border-neutral-200">
                <div className="container py-16 flex flex-col items-center text-center animate-fade-in">
                    <div className="mb-6 inline-flex items-center justify-center p-3 bg-primary-100 rounded-2xl text-primary-600">
                        <Construction size={48} />
                    </div>
                    <h1 className="text-display-md md:text-display-lg text-neutral-900 mb-4">
                        Travaux Routiers <span className="text-primary-600">Antananarivo</span>
                    </h1>
                    <p className="text-body-lg text-neutral-600 max-w-2xl mb-8">
                        Contribuez à l'amélioration de la circulation dans la ville des Mille.
                        Signalez les zones de travaux et suivez l'évolution des chantiers en temps réel.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold shadow-soft transition-all flex items-center gap-2">
                            Signaler un chantier <ArrowRight size={20} />
                        </button>
                        <button className="bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 px-8 py-3 rounded-xl font-semibold transition-all">
                            Voir la carte
                        </button>
                    </div>
                </div>
            </div>

            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Carte 1 */}
                    <div className="bg-white p-8 rounded-4xl shadow-soft border border-neutral-100 animate-slide-up">
                        <div className="text-primary-500 mb-4">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-h3 text-neutral-800 mb-2">Géolocalisation</h3>
                        <p className="text-body-sm text-neutral-500">
                            Identifiez précisément l'emplacement des travaux à travers les six arrondissements.
                        </p>
                    </div>

                    {/* Carte 2 */}
                    <div className="bg-white p-8 rounded-4xl shadow-soft border border-neutral-100 animate-slide-up [animation-delay:100ms]">
                        <div className="text-warning-DEFAULT mb-4">
                            <Info size={32} />
                        </div>
                        <h3 className="text-h3 text-neutral-800 mb-2">Suivi en temps réel</h3>
                        <p className="text-body-sm text-neutral-500">
                            Consultez l'état d'avancement : en attente, en cours, ou finalisé.
                        </p>
                    </div>

                    {/* Carte 3 */}
                    <div className="bg-white p-8 rounded-4xl shadow-soft border border-neutral-100 animate-slide-up [animation-delay:200ms]">
                        <div className="text-success-DEFAULT mb-4">
                            <Construction size={32} />
                        </div>
                        <h3 className="text-h3 text-neutral-800 mb-2">Participation</h3>
                        <p className="text-body-sm text-neutral-500">
                            Chaque citoyen peut envoyer des photos et des descriptions pour aider la communauté.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;