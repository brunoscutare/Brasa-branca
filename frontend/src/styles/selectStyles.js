const PRIMARY = {
    50: "var(--color-brand-panel)",
    100: "var(--color-brand-panel)",
    500: "var(--color-brand-primary)",
    600: "var(--color-brand-ink)",
    700: "var(--color-brand-ink)"
};

export const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "48px",
        padding: "2px",
        borderRadius: "0.75rem",
        backgroundColor: "var(--color-brand-surface)",
        borderColor: state.isFocused ? "var(--color-brand-accent)" : "var(--color-brand-input-border)",
        boxShadow: state.isFocused ? "0 0 0 1px var(--color-brand-accent)" : "none",
        cursor: "pointer",
        "&:hover": {
            borderColor: PRIMARY[500]
        }
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? PRIMARY[500]
            : state.isFocused
              ? PRIMARY[50]
              : "transparent",
        color: state.isSelected ? "var(--color-brand-surface)" : PRIMARY[700],
        cursor: "pointer",
        "&:active": {
            backgroundColor: PRIMARY[600]
        }
    }),
    menu: (base) => ({
        ...base,
        borderRadius: "0.75rem",
        overflow: "hidden",
        backgroundColor: "var(--color-brand-surface)",
        border: "1px solid var(--color-brand-border)",
        boxShadow: "0 4px 6px -1px rgba(91, 52, 24, 0.12), 0 2px 4px -1px rgba(91, 52, 24, 0.08)"
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999
    }),
    input: (base) => ({
        ...base,
        color: PRIMARY[700]
    }),
    singleValue: (base) => ({
        ...base,
        color: PRIMARY[700]
    }),
    placeholder: (base) => ({
        ...base,
        color: "var(--color-brand-muted)"
    }),
    indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: "rgba(61,35,21,0.15)"
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: state.isFocused ? PRIMARY[500] : "var(--color-brand-muted)",
        "&:hover": {
            color: PRIMARY[500]
        }
    }),
    clearIndicator: (base) => ({
        ...base,
        color: "var(--color-brand-muted)",
        "&:hover": {
            color: PRIMARY[500]
        }
    })
};
