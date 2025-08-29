import { Button as DassaultButton } from '@/design-system/components/buttons'

const Button = (
    {
        buttonType = "scream",
        size = 'large',
        greyButton = false,
        label = "button",
        weight = "bold",
        ...props
    }
) => {
    return (
        <DassaultButton
            weight={weight}
            type="button"
            buttonType={buttonType}
            size={size}
            aria-label={buttonType === "circle" ? label : undefined}
            greyButton={greyButton}
            {...props}
        >
            {props.children}
        </DassaultButton>
    );
}

Button.PropsTypes

export default Button;