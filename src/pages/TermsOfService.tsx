import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import DOMPurify from "dompurify";
import SEOHead from "@/components/SEOHead";

const TermsOfService = () => {
  const { data: page, isLoading, error } = usePageContent("terms-of-service");

  // Default content if database fails
  const defaultTitle = "Terms of Service";
  const defaultDate = "December 18, 2024";

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={page?.meta_title || `${defaultTitle} | Nullsto`}
        description={page?.meta_description || "Read our terms of service to understand the rules for using Nullsto."}
      />
      <Header />
      <main className="pt-28 md:pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {page?.title || defaultTitle}
            </h1>
            <p className="text-muted-foreground">
              Last updated: {page?.last_updated ? new Date(page.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : defaultDate}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 md:p-12"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error || !page ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Unable to load page content. Please try again later.</p>
              </div>
            ) : (
              <div
                className="page-content space-y-8"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(page.content),
                }}
              />
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
