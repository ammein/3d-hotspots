import PropTypes from 'prop-types'
import { default as HeadlineComponent } from '@/components/Headline'

export const Headline = ({
    type = 'h1',
    weight,
    title
}) => {
    return <HeadlineComponent weight={weight} type={type}>{title}</HeadlineComponent>
}

Headline.propTypes = {
    /** Size of the Heading */
    type: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4']),
    /** Title */
    title: PropTypes.string.isRequired,
    /** Weight of a font */
    weight: PropTypes.oneOf(['semibold', 'bold'])
}