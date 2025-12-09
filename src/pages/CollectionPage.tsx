import { useApp } from "@/context/AppContext";
import { TemplateCard } from "@/components/TemplateCard";
import { TemplatePreviewModal } from "@/components/TemplatePreviewModal";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import { Template, TEMPLATES } from "@/constants/templates";

export default function CollectionPage() {
    const { savedTemplateIds, myTemplates } = useApp();
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    // Filter templates that are saved (From both Official and Custom)
    const allTemplates = [...TEMPLATES, ...myTemplates];
    const savedTemplates = allTemplates.filter(t => savedTemplateIds.includes(t.id));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Collection</h1>
                <p className="text-muted-foreground mt-2">
                    Your saved templates and favorites (Official & Custom).
                </p>
            </div>

            {savedTemplates.length === 0 ? (
                <div className="text-center py-20">
                    <Bookmark className="size-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-lg font-medium">No saved templates</p>
                    <p className="text-muted-foreground">Go to the Gallery or Studio and save some templates!</p>
                </div>
            ) : (
                // Masonry Layout for Waterfall Effect
                <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                    {savedTemplates.map((template) => (
                        <div key={template.id} className="relative group break-inside-avoid">
                            <TemplateCard
                                template={template}
                                onPreview={setSelectedTemplate}
                                onClick={() => setSelectedTemplate(template)}
                                showCategoryLabel={true}
                                overrideLabel={template.category === 'Custom' ? 'CUSTOM' : 'OFFICIAL'}
                            />
                        </div>
                    ))}
                </div>
            )}

            <TemplatePreviewModal
                template={selectedTemplate}
                isOpen={!!selectedTemplate}
                onClose={() => setSelectedTemplate(null)}
            />
        </div>
    );
}
