import { Checkbox } from "@/vendor/coss/ui/checkbox";
import { CheckboxGroup } from "@/vendor/coss/ui/checkbox-group";
import { Label } from "@/vendor/coss/ui/label";

export default function Particle() {
  return (
    <CheckboxGroup aria-label="Select frameworks" defaultValue={["next"]}>
      <Label>
        <Checkbox value="next" />
        Next.js
      </Label>
      <Label>
        <Checkbox value="vite" />
        Vite
      </Label>
      <Label>
        <Checkbox value="astro" />
        Astro
      </Label>
    </CheckboxGroup>
  );
}
