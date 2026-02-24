import { useLoader } from "@/hooks/useLoader";
import { Card, CardContent } from "@/components/ui/card";

const Loader: React.FC = () => {
  const { isVisible, message } = useLoader();

  if (!isVisible) return null;

  return (
    <div>
      <style>
        {`
.loader {
  width: 12px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: oklch(0.546 0.245 262.881);
  clip-path: inset(-220%);
  animation: l28 2s infinite linear;
  margin-bottom: 24px;
}
@keyframes l28 {
  0%  {box-shadow:0 0 0 0   oklch(0.546 0.245 262.881), 40px 0 oklch(0.546 0.245 262.881), -40px 0 oklch(0.546 0.245 262.881), 0 40px oklch(0.546 0.245 262.881), 0 -40px oklch(0.546 0.245 262.881)}
  10% {box-shadow:0 0 0 0   oklch(0.546 0.245 262.881), 12px 0 oklch(0.546 0.245 262.881), -40px 0 oklch(0.546 0.245 262.881), 0 40px oklch(0.546 0.245 262.881), 0 -40px oklch(0.546 0.245 262.881)}
  20% {box-shadow:0 0 0 4px oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), -40px 0 oklch(0.546 0.245 262.881), 0 40px oklch(0.546 0.245 262.881), 0 -40px oklch(0.546 0.245 262.881)}
  30% {box-shadow:0 0 0 4px oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), -12px 0 oklch(0.546 0.245 262.881), 0 40px oklch(0.546 0.245 262.881), 0 -40px oklch(0.546 0.245 262.881)}
  40% {box-shadow:0 0 0 8px oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0 40px oklch(0.546 0.245 262.881), 0 -40px oklch(0.546 0.245 262.881)}
  50% {box-shadow:0 0 0 8px oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0 12px oklch(0.546 0.245 262.881), 0 -40px oklch(0.546 0.245 262.881)}
  60% {box-shadow:0 0 0 12px oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0 0px oklch(0.546 0.245 262.881), 0 -40px oklch(0.546 0.245 262.881)}
  70% {box-shadow:0 0 0 12px oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0 0px oklch(0.546 0.245 262.881), 0 -12px oklch(0.546 0.245 262.881)}
  80% {box-shadow:0 0 0 16px oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0px 0 oklch(0.546 0.245 262.881), 0 0px oklch(0.546 0.245 262.881), 0 0px oklch(0.546 0.245 262.881)}
  90%,100%{box-shadow:0 0 0 0 oklch(0.546 0.245 262.881), 40px 0 oklch(0.546 0.245 262.881), -40px 0 oklch(0.546 0.245 262.881), 0 40px oklch(0.546 0.245 262.881), 0 -40px oklch(0.546 0.245 262.881)}
}
        `}
      </style>

      <div className="fixed h-screen w-screen inset-0 z-[1000] flex items-center justify-center bg-background/30 dark:bg-background/50 backdrop-blur-sm">
        <Card className="border-0 bg-background min-w-68">
          <CardContent className="flex flex-col gap-4 items-center p-6 pt-12">
            <div className="loader" />
            <div className="font-bold mt-4">{message}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Loader;
