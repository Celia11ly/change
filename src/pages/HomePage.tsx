import { Template } from "@/constants/templates"; // Remove TEMPLATES import
import { TemplateCard } from "@/components/TemplateCard";
import { TemplatePreviewModal } from "@/components/TemplatePreviewModal";
import { useState } from "react";
import { useApp } from "@/context/AppContext"; // Import useApp

export default function HomePage() {
    const { officialTemplates, categories } = useApp(); // Consume Context
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Filter Logic
    // Filter Logic
    const filteredTemplates = (() => {
        if (selectedCategory === "All") return officialTemplates;

        if (selectedCategory === "Others") {
            // Find all known categories that are NOT 'All' and NOT 'Others'
            const knownCategories = categories
                .filter(c => c.id !== "All" && c.id !== "Others")
                .map(c => c.label); // Assuming id=label logic from context

            // Return templates that do NOT match any known category, OR explicitly match 'Others'
            return officialTemplates.filter(t =>
                !knownCategories.includes(t.category) || t.category === "Others"
            );
        }

        return officialTemplates.filter(t => t.category === selectedCategory);
    })();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Explore Templates</h1>
                <p className="text-muted-foreground mt-2">
                    Choose from 18+ premium templates to start creating your video content.
                </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${selectedCategory === cat.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary/50"
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Masonry Layout: columns-2 for mobile as requested, adapting to larger screens */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {filteredTemplates.map((template) => (
                    <TemplateCard
                        key={template.id}
                        template={template}
                        onPreview={setSelectedTemplate}
                        onClick={() => setSelectedTemplate(template)}
                    />
                ))}
            </div>
            {filteredTemplates.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    No templates found in this category.
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
