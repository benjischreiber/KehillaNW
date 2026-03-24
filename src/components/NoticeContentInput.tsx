import {useMemo} from "react";
import {set, unset, type PortableTextInputProps} from "sanity";
import {decodePortableTextValue} from "@/lib/utils";

export default function NoticeContentInput(props: PortableTextInputProps) {
  const decodedValue = useMemo(() => decodePortableTextValue(props.value), [props.value]);
  const hasEncodedEntities =
    JSON.stringify(decodedValue) !== JSON.stringify(props.value);

  const handleClean = () => {
    if (!hasEncodedEntities) return;

    if (decodedValue === undefined) {
      props.onChange(unset());
      return;
    }

    props.onChange(set(decodedValue));
  };

  return (
    <div>
      {hasEncodedEntities && (
        <div style={{marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap"}}>
          <button
            type="button"
            onClick={handleClean}
            style={{
              border: "1px solid #d0d5dd",
              borderRadius: "999px",
              padding: "0.4rem 0.8rem",
              background: "white",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clean pasted bullets/entities
          </button>
          <span style={{fontSize: "0.875rem", color: "#667085"}}>
            Converts things like <code>&amp;bull;</code> into proper characters before publishing.
          </span>
        </div>
      )}
      {props.renderDefault(props)}
    </div>
  );
}
