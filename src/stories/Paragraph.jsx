import { Body } from "@/components/Body"
import PropTypes from "prop-types"

export const Paragraph = ({
    type = 'body',
    style = 'regular',
    content = 'Lorem ipsum mi nascetur pellentesque id aliquet porta consectetur auctor eget eget egestas eleifend pretium tristique morbi in sed ultrices dolor massa ullamcorper enim cras purus scelerisque a ut malesuada tincidunt pretium consectetur ultrices eu malesuada leo pellentesque tristique velit.',
    ...props
}) => {
    return <Body type={type} style={style} {...props}>{content}</Body>
}

Paragraph.propTypes = {
    type: PropTypes.oneOf(['body', 'caption']),
    style: PropTypes.oneOf(['regular', 'italic']),
    content: PropTypes.string.isRequired
}