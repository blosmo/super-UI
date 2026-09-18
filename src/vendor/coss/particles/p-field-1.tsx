import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/vendor/coss/ui/field";
import { Input } from "@/vendor/coss/ui/input";

export default function Particle() {
  return (
    <Field>
      <FieldLabel>Name</FieldLabel>
      <Input placeholder="Enter your name" type="text" />
      <FieldDescription>Visible on your profile</FieldDescription>
    </Field>
  );
}
