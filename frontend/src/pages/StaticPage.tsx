import React from 'react';
import { Shield, Info, FileText, Lock, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StaticPageProps {
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

export const StaticPage: React.FC<StaticPageProps> = ({ title, icon, content }) => {
    return (
        <div className="min-h-screen bg-slate-950 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                <div className="card p-8 md:p-12 mb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                            {icon}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                            {title}
                        </h1>
                    </div>

                    <div className="prose prose-invert prose-slate max-w-none">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Specific content wrappers
export const SafetyTips = () => (
    <StaticPage
        title="Safety Tips"
        icon={<Shield className="h-6 w-6 text-brand-400" />}
        content={
            <div className="space-y-6 text-slate-300">
                <p>Connecting with people in your community is what makes Cragialist great. To ensure a safe experience, please keep these tips in mind:</p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-white font-bold mb-3">Meet in Public</h3>
                        <p className="text-sm">Always arrange to meet in a well-lit, public location like a coffee shop or a police station "safe zone".</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-white font-bold mb-3">Trust Your Instincts</h3>
                        <p className="text-sm">If something feels too good to be true or makes you uncomfortable, don't hesitate to walk away.</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-white font-bold mb-3">Payment Safety</h3>
                        <p className="text-sm">Avoid wire transfers or cashier's checks. Cash or secure digital payments in person are generally best.</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-white font-bold mb-3">Protect Personal Info</h3>
                        <p className="text-sm">Don't share sensitive photos, bank details, or your home address until you've established trust.</p>
                    </div>
                </div>
                <p className="mt-8 text-sm italic border-t border-slate-800 pt-6">Report any suspicious activity to our support team immediately.</p>
            </div>
        }
    />
);

export const PostingGuidelines = () => (
    <StaticPage
        title="Posting Guidelines"
        icon={<Info className="h-6 w-6 text-brand-400" />}
        content={
            <div className="space-y-6 text-slate-300">
                <p>Help us keep Cragialist a high-quality marketplace by following these simple posting rules:</p>
                <ul className="list-disc pl-6 space-y-4">
                    <li><strong>Accuracy:</strong> Provide clear, honest descriptions and actual photos of the items or services you are offering.</li>
                    <li><strong>Categorization:</strong> Post your ad in the most relevant category to help buyers find it.</li>
                    <li><strong>No Spam:</strong> Avoid duplicate postings or multiple ads for the same item.</li>
                    <li><strong>Prohibited Items:</strong> Do not post illegal goods, weapons, drugs, or adult services. Refer to our TOS for a full list.</li>
                    <li><strong>Local Focus:</strong> Focus on transactions within your local community for the best experience.</li>
                </ul>
            </div>
        }
    />
);

export const TermsOfService = () => (
    <StaticPage
        title="Terms of Service"
        icon={<FileText className="h-6 w-6 text-brand-400" />}
        content={
            <div className="space-y-6 text-slate-300">
                <section>
                    <h3 className="text-white font-bold mb-3">1. Acceptance of Terms</h3>
                    <p>By using Cragialist, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
                </section>
                <section>
                    <h3 className="text-white font-bold mb-3">2. User Responsibilities</h3>
                    <p>Users are solely responsible for the content they post and the interactions they have. Cragialist does not verify listings or users.</p>
                </section>
                <section>
                    <h3 className="text-white font-bold mb-3">3. Prohibited Conduct</h3>
                    <p>Fraudulent activity, harassment, and the posting of illegal content are strictly prohibited and may result in account termination.</p>
                </section>
                <section>
                    <h3 className="text-white font-bold mb-3">4. Limitation of Liability</h3>
                    <p>Cragialist is provided "as is" and is not liable for any damages resulting from transactions or interactions on the platform.</p>
                </section>
            </div>
        }
    />
);

export const PrivacyPolicy = () => (
    <StaticPage
        title="Privacy Policy"
        icon={<Lock className="h-6 w-6 text-brand-400" />}
        content={
            <div className="space-y-6 text-slate-300">
                <section>
                    <h3 className="text-white font-bold mb-3">Information Collection</h3>
                    <p>We collect minimal information required to facilitate listings and communication, such as your username, email, and location (if provided).</p>
                </section>
                <section>
                    <h3 className="text-white font-bold mb-3">Data Usage</h3>
                    <p>Your data is used to provide service functionality and improve your experience. We do not sell your personal information to third parties.</p>
                </section>
                <section>
                    <h3 className="text-white font-bold mb-3">Communication</h3>
                    <p>Your email is used for account notifications and chat alerts. Other users can only contact you through our internal messaging system unless you share details privately.</p>
                </section>
                <section>
                    <h3 className="text-white font-bold mb-3">Security</h3>
                    <p>We implement industry-standard security measures to protect your data, but no online platform is 100% secure. Please use strong passwords.</p>
                </section>
            </div>
        }
    />
);
