import { Helmet } from "react-helmet-async";

export default function SEO({ title, description, image, url }) {
    const siteTitle = "GRIDLOCK — Find Games That Matter";
    const fullTitle = title ? `${title} | GRIDLOCK` : siteTitle;
    const siteDescription = description || "The definitive platform for curated game verdicts, editorial reviews, and your personalized gaming rewind.";
    const siteUrl = "https://gridlock.gg"; // Mock URL for SEO
    const currentUrl = url ? siteUrl + url : siteUrl;
    const siteImage = image || "/og-image.png";

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={siteDescription} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image" content={siteImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={siteDescription} />
            <meta property="twitter:image" content={siteImage} />
        </Helmet>
    );
}
