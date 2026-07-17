import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileUp, UploadCloud, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { invoiceApi } from "@/services/invoice.service";
import { formatDate } from "@/lib/utils";

const ACCEPT = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

export function InvoiceUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (f: File) => invoiceApi.upload(f, setProgress),
    onSuccess: (res) => {
      setUploadedAt(new Date().toISOString());
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Invoice uploaded", {
        description: `${res.invoice.invoiceNumber} · ${res.status}`,
      });
    },
  });

  const onSelect = useCallback((f: File | null) => {
    if (!f) return;
    const ok =
      ["application/pdf", "image/png", "image/jpeg"].includes(f.type) ||
      /\.(pdf|png|jpe?g)$/i.test(f.name);
    if (!ok) {
      toast.error("Only PDF, PNG, and JPG files are supported");
      return;
    }
    setFile(f);
    setProgress(0);
    setUploadedAt(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    onSelect(e.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div>
      <PageHeader
        title="Invoice Upload"
        description="Drop PDF, PNG, or JPG invoices to start AI processing."
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                <UploadCloud className="h-8 w-8" />
              </div>
              <p className="text-base font-medium">Drag & drop your invoice here</p>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF, PNG, JPG up to 10MB
              </p>
              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80">
                <FileUp className="h-4 w-4" />
                Browse files
                <input
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {file ? (
              <div className="mt-6 space-y-4 rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                      {uploadedAt ? ` · Uploaded ${formatDate(uploadedAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null);
                        setProgress(0);
                        setUploadedAt(null);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={() => mutation.mutate(file)}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Uploading…" : "Upload Invoice"}
                    </Button>
                  </div>
                </div>

                {(mutation.isPending || progress > 0) && (
                  <div>
                    <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                      <span>Upload progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {mutation.isSuccess ? (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Uploaded as {mutation.data.invoice.invoiceNumber}. Status:{" "}
                    {mutation.data.status}
                    <Button
                      size="sm"
                      variant="link"
                      className="ml-auto h-auto p-0"
                      onClick={() => navigate("/invoices")}
                    >
                      View invoices
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
