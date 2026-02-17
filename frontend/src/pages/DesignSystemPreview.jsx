import React from 'react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const DesignSystemPreview = () => {
    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Design System Preview</h1>
                    <p className="text-[var(--color-text-secondary)]">Overview of the implemented components and styles.</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Colors</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-[var(--color-primary)] text-white">Primary</div>
                        <div className="p-4 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">Primary Light</div>
                        <div className="p-4 rounded-lg bg-[var(--color-primary-hover)] text-white">Primary Hover</div>
                        <div className="p-4 rounded-lg bg-[var(--color-secondary)] text-[var(--color-primary)]">Secondary</div>
                        <div className="p-4 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)]">Background</div>
                        <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">Surface</div>
                        <div className="p-4 rounded-lg bg-[var(--color-success)] text-white">Success</div>
                        <div className="p-4 rounded-lg bg-[var(--color-info)] text-[var(--color-primary)]">Info</div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Typography</h2>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Heading 1 (24px Bold)</h1>
                        <h2 className="text-xl font-semibold">Heading 2 (20px SemiBold)</h2>
                        <h3 className="text-lg font-medium">Heading 3 (18px Medium)</h3>
                        <p className="text-base">Body Primary (16px Regular) - The quick brown fox jumps over the lazy dog.</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">Body Secondary (14px Regular) - The quick brown fox jumps over the lazy dog.</p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Buttons</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="ghost">Ghost Button</Button>
                        <Button variant="outline">Outline Button</Button>
                        <Button variant="primary" disabled>Disabled</Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button size="sm">Small</Button>
                        <Button size="md">Medium</Button>
                        <Button size="lg">Large</Button>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Inputs</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Default Input" />
                        <Input placeholder="Error Input" error="This field is required" />
                        <Input placeholder="Disabled Input" disabled />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Cards</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <h3 className="text-lg font-semibold mb-2">Basic Card</h3>
                            <p className="text-[var(--color-text-secondary)]">This is a basic card component with standard padding and shadow.</p>
                        </Card>
                        <Card className="flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-[var(--color-text-primary)]">DKB solo</h3>
                                        <p className="text-sm text-[var(--color-text-secondary)]">DE90 1203 0000 1078 3974 69</p>
                                    </div>
                                    <span className="text-xl font-bold text-[var(--color-text-primary)]">261,88 €</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button variant="primary" size="sm">Überweisung</Button>
                                <Button variant="secondary" size="sm">Umsatzliste</Button>
                                <Button variant="ghost" size="sm">Kontodetails</Button>
                            </div>
                        </Card>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default DesignSystemPreview;
