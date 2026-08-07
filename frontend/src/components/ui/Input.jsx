export default function Input({
    error,
    label,
    required,
    className = "",
    multiline = false,
    rows = 4,
    ...props
}) {
    const fieldClassName = [
        "w-full rounded-xl border bg-[#FAF3E7] px-4 py-3 text-[#5B3418] outline-none transition placeholder:text-[#8B7B70]",
        error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-[#8B4513]/20 focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/15",
        className
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="grid gap-2">
            {label ? (
                <label className="text-sm font-medium text-[#5B3418]">
                    {label}
                    {required ? <span className="ml-1 text-red-500">*</span> : null}
                </label>
            ) : null}

            {multiline ? (
                <textarea className={fieldClassName} rows={rows} {...props} />
            ) : (
                <input className={fieldClassName} {...props} />
            )}

            <p className="min-h-5 text-sm leading-5 text-red-600" aria-live="polite">
                {error || "\u00A0"}
            </p>
        </div>
    );
}
