/**
 * JSON-LD Structured Data Components
 * Helps Google show rich snippets in search results
 */

// Website Schema - for sitelinks search box
export function WebsiteSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Swipe",
        url: "https://swipeemail.com",
        description: "The privacy-first inbox cleaner that's actually fun to use",
        potentialAction: {
            "@type": "SearchAction",
            target: "https://swipeemail.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// SoftwareApplication Schema - for app store style results
export function SoftwareApplicationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Swipe",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            description: "Free tier available",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "12000",
            bestRating: "5",
            worstRating: "1",
        },
        description: "The privacy-first inbox cleaner that's actually fun to use. Clean thousands of emails with satisfying swipe gestures.",
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Organization Schema - brand info
export function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Swipe Inc.",
        url: "https://swipeemail.com",
        logo: "https://swipeemail.com/logo.png",
        sameAs: [
            "https://twitter.com/swipeemail",
        ],
        contactPoint: {
            "@type": "ContactPoint",
            email: "hello@swipeemail.com",
            contactType: "customer service",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// FAQ Schema - for FAQ rich results
export function FAQSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "Do you read my emails?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. We only access metadata (sender, subject). Never email content.",
                },
            },
            {
                "@type": "Question",
                name: "Is my data sold?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Never. We don't sell your data. Our revenue comes from Pro subscriptions.",
                },
            },
            {
                "@type": "Question",
                name: "Can I cancel anytime?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Cancel in 2 clicks. No retention tricks.",
                },
            },
            {
                "@type": "Question",
                name: "What permissions do you need?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "gmail.readonly and gmail.modify (to trash emails). We can't delete permanently.",
                },
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Combined export for landing page
export function LandingPageSchemas() {
    return (
        <>
            <WebsiteSchema />
            <SoftwareApplicationSchema />
            <OrganizationSchema />
            <FAQSchema />
        </>
    );
}
