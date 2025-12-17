import { CheckCircle, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportType: 'lost' | 'found';
    onReportAnother: () => void;
}

export function SuccessDialog({
    open,
    onOpenChange,
    reportType,
    onReportAnother
}: SuccessDialogProps) {

    const handleReportAnother = () => {
        onOpenChange(false);
        onReportAnother();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-green-100 p-4">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-green-600">Success!</DialogTitle>
                    <DialogDescription className="text-center">
                        Thanks for Your Report
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-gray-700 text-center leading-relaxed">
                        Your {reportType} item report has been submitted successfully. We've recorded all the details
                        and your item will now be visible to other users on the platform.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm text-center">
                            We'll notify you via email if someone contacts you about this item.
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Button
                            onClick={handleReportAnother}
                            className="w-full gap-2"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Report Another Item
                        </Button>
                        <Button
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="w-full gap-2"
                        >
                            Close
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
