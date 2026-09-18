import { previews } from "./previews";
export default function PreviewFrame({
  id,
  dark,
}: {
  id: string;
  dark?: boolean;
}) {
  const Demo = previews[id];
  return Demo ? (
    <div className="preview-content">
      <Demo dark={dark} />
    </div>
  ) : null;
}
