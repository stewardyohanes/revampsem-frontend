import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import API from "../../networks/api";
import { QRCodeValidateResponseDto, QRCodeCheckInResponseDto } from "../../types/dto";

export default function QRCheckInPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [qrData, setQrData] = useState<QRCodeValidateResponseDto | null>(null);
  const [checkInResult, setCheckInResult] = useState<QRCodeCheckInResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate QR code token on component mount
  useEffect(() => {
    if (!token) {
      setError("Token QR code tidak valid");
      setIsLoading(false);
      return;
    }

    validateQRCode();
  }, [token]);

  const validateQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await API.QRCODE.VALIDATE(token!);
      
      if (result.success) {
        setQrData(result);
        
        // Check if QR code is already used
        if (result.data.is_used) {
          setError("QR code ini sudah digunakan sebelumnya");
          toast({
            title: "QR Code Sudah Digunakan",
            description: `QR code ini sudah digunakan pada ${new Date(result.data.used_at!).toLocaleString('id-ID')}`,
            variant: "destructive",
          });
          return;
        }

        // Check if QR code is expired
        const expiresAt = new Date(result.data.expires_at);
        const now = new Date();
        
        if (now > expiresAt) {
          setError("QR code ini sudah kedaluwarsa");
          toast({
            title: "QR Code Kedaluwarsa",
            description: "QR code ini sudah melewati batas waktu 24 jam",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "QR Code Valid",
          description: "QR code berhasil divalidasi. Silakan lakukan check-in.",
        });
      } else {
        throw new Error(result.message || "QR code tidak valid");
      }
    } catch (error) {
      console.error("Error validating QR code:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat memvalidasi QR code";
      setError(errorMessage);
      toast({
        title: "Validasi Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!token || !qrData) return;

    try {
      setIsCheckingIn(true);
      
      const result = await API.QRCODE.CHECKIN({ token });
      
      if (result.success) {
        setCheckInResult(result);
        toast({
          title: "Check-in Berhasil!",
          description: `Selamat datang ${result.data.present.name}! Status Anda telah diubah menjadi Approved.`,
        });
      } else {
        throw new Error(result.message || "Check-in gagal");
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat check-in";
      setError(errorMessage);
      toast({
        title: "Check-in Gagal",
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
    
    if (timeRemaining <= 0) return "Kedaluwarsa";
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} jam ${minutes} menit`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
            <p className="text-gray-600">Memvalidasi QR code...</p>
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
            <CardTitle className="text-red-600">QR Code Tidak Valid</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="w-full"
            >
              Kembali ke Beranda
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
            <CardTitle className="text-green-600">Check-in Berhasil!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nama:</span>
                  <p className="font-semibold">{checkInResult.data.present.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="font-semibold">{checkInResult.data.present.email || "-"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Event:</span>
                  <p className="font-semibold">{checkInResult.data.event.event}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Check-in:</span>
                  <p className="font-semibold">
                    {new Date(checkInResult.data.checked_in_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600">
              Status Anda telah berubah dari <span className="font-semibold text-orange-600">Approve</span> menjadi <span className="font-semibold text-green-600">Approved</span>
            </p>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Selesai
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
          {qrData && (
            <div className="bg-orange-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nama:</span>
                  <p className="font-semibold">{qrData.data.present.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="font-semibold">{qrData.data.present.email || "-"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Event:</span>
                  <p className="font-semibold">{qrData.data.event.event}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Sisa Waktu:</span>
                  <p className="font-semibold text-orange-600">{getTimeRemaining()}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              QR code ini akan kedaluwarsa dalam 24 jam setelah dibuat
            </p>
          </div>

          <Button 
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isCheckingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sedang Check-in...
              </>
            ) : (
              "Lakukan Check-in"
            )}
          </Button>
          
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="w-full"
          >
            Batal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}