import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Eye,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import API from "../../networks/api";
import {
  QRCodeValidateResponseDto,
  QRCodeCheckInResponseDto,
} from "../../types/dto";
import { useIsAuth } from "../../services/auth/hooks/use-is-auth";
import { getUserData } from "../../lib/token-manager";

export default function QRCheckInPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: authData } = useIsAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [qrData, setQrData] = useState<QRCodeValidateResponseDto | null>(null);
  const [checkInResult, setCheckInResult] =
    useState<QRCodeCheckInResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<number | null>(null);

  // Validate QR code token on component mount
  useEffect(() => {
    if (!token) {
      setError("Invalid QR code token");
      setIsLoading(false);
      return;
    }

    // Get user level from localStorage or auth data
    const userData = getUserData();
    const level = authData?.user?.level ?? userData?.level;
    setUserLevel(level as number);

    validateQRCode();
  }, [token, authData]);

  const validateQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await API.QRCODE.VALIDATE(token!);

      if (result.success) {
        setQrData(result);

        // Check if QR code is already used
        if (result.data.is_used) {
          setError("This QR code has already been used");
          toast({
            title: "QR Code Already Used",
            description: `This QR code was used on ${new Date(
              result.data.used_at!
            ).toLocaleString("en-US")}`,
            variant: "destructive",
          });
          return;
        }

        // Check if QR code is expired
        const expiresAt = new Date(result.data.expires_at);
        const now = new Date();

        if (now > expiresAt) {
          setError("This QR code has expired");
          toast({
            title: "QR Code Expired",
            description: "This QR code has exceeded the 24-hour time limit",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "QR Code Valid",
          description:
            "QR code successfully validated. Please proceed with check-in.",
        });
      } else {
        throw new Error(result.message || "Invalid QR code");
      }
    } catch (error) {
      console.error("Error validating QR code:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while validating QR code";
      setError(errorMessage);
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!token || !qrData) return;

    // Check if user has admin privileges (level 0 or 1)
    if (userLevel !== 0 && userLevel !== 1) {
      toast({
        title: "Access Denied",
        description:
          "Only administrators can perform check-in. You only have access to view QR code information.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCheckingIn(true);

      const result = await API.QRCODE.CHECKIN({ token });

      if (result.success) {
        setCheckInResult(result);
        toast({
          title: "Check-in Successful!",
          description: `Welcome ${result.data.present.name}! Your status has been changed to Approved.`,
        });
      } else {
        throw new Error(result.message || "Check-in failed");
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during check-in";
      setError(errorMessage);
      toast({
        title: "Check-in Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const getTimeRemaining = () => {
    if (!qrData) return null;

    const expiresAt = new Date(qrData.data.expires_at);
    const now = new Date();
    const timeRemaining = expiresAt.getTime() - now.getTime();

    if (timeRemaining <= 0) return "Expired";

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );

    return `${hours} hours ${minutes} minutes`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
            <p className="text-gray-600">Validating QR code...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Invalid QR Code</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkInResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">
              Check-in Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <p className="font-semibold">
                    {checkInResult.data.present.name}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="font-semibold">
                    {checkInResult.data.present.email || "-"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Event:</span>
                  <p className="font-semibold">
                    {checkInResult.data.event.event}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Check-in:</span>
                  <p className="font-semibold">
                    {new Date(checkInResult.data.checked_in_at).toLocaleString(
                      "en-US"
                    )}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600">
              Your status has changed from{" "}
              <span className="font-semibold text-orange-600">Approve</span> to{" "}
              <span className="font-semibold text-green-600">Approved</span>
            </p>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-orange-600">QR Code Valid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Access Level Indicator */}
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              userLevel === 0 || userLevel === 1
                ? "bg-green-50 border border-green-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            {userLevel === 0 || userLevel === 1 ? (
              <>
                <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Administrator</p>
                  <p className="text-green-700">
                    You have access to perform check-in
                  </p>
                </div>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Reader</p>
                  <p className="text-blue-700">
                    You can only view QR code information
                  </p>
                </div>
              </>
            )}
          </div>

          {qrData && (
            <div className="bg-orange-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <p className="font-semibold">{qrData.data.present.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="font-semibold">
                    {qrData.data.present.email || "-"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Event:</span>
                  <p className="font-semibold">{qrData.data.event.event}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Time Remaining:
                  </span>
                  <p className="font-semibold text-orange-600">
                    {getTimeRemaining()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              This QR code will expire within 24 hours after creation
            </p>
          </div>

          <Button
            onClick={handleCheckIn}
            disabled={isCheckingIn || (userLevel !== 0 && userLevel !== 1)}
            className={`w-full ${
              userLevel === 0 || userLevel === 1
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            title={
              userLevel !== 0 && userLevel !== 1
                ? "Only administrators can perform check-in"
                : ""
            }
          >
            {isCheckingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking in...
              </>
            ) : userLevel === 0 || userLevel === 1 ? (
              "Perform Check-in"
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                View Only
              </>
            )}
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
