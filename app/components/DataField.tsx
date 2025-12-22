interface DataFieldProps {
  label: string;
  value: string | string[];
}

export default function DataField({ label, value }: DataFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-grey text-sm">{label}</span>
      {Array.isArray(value) ? (
        <div className="flex flex-col gap-0.5">
          {value.map((item, index) => (
            <span key={index} className="text-white text-sm">{item}</span>
          ))}
        </div>
      ) : (
        <span className="text-white">{value}</span>
      )}
    </div>
  );
}
