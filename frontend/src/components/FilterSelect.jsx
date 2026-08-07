import { useMemo } from "react";
import Select from "react-select";
import { selectStyles } from "../styles/selectStyles";

export default function FilterSelect({
    inputId,
    options,
    value,
    onChange,
    defaultValue,
    placeholder,
    isSearchable = false,
    isClearable = true,
    allowEmpty = false,
    noOptionsMessage,
    className = ""
}) {
    const selected = useMemo(() => {
        if (allowEmpty && (value === "" || value == null)) return null;

        const match = options.find((option) => option.value === value);
        if (match) return match;

        if (defaultValue != null) {
            return options.find((option) => option.value === defaultValue) ?? options[0];
        }

        return allowEmpty ? null : options[0];
    }, [options, value, defaultValue, allowEmpty]);

    return (
        <div className={className}>
            <Select
                inputId={inputId}
                options={options}
                value={selected}
                onChange={(option) =>
                    onChange(option?.value ?? (allowEmpty ? "" : defaultValue ?? options[0]?.value))
                }
                placeholder={placeholder}
                isSearchable={isSearchable}
                isClearable={isClearable}
                noOptionsMessage={noOptionsMessage ? () => noOptionsMessage : undefined}
                styles={selectStyles}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
            />
        </div>
    );
}
