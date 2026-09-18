import { Button } from "@/vendor/coss/ui/button";
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@/vendor/coss/ui/tooltip";

export default function Particle() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>
        Hover me
      </TooltipTrigger>
      <TooltipPopup>Helpful hint</TooltipPopup>
    </Tooltip>
  );
}
