import { 
    Paragraph
} from '@/design-system/atoms/typography';

export const Body = ({
    type = 'body',
    color,
    style,
    ...props
}) => {

    // 3. Render the selected component
    return (
        <Paragraph as={type !== 'body' && 'span'} style={style} color={color} type={type} {...props}/>
    );
};

Body.displayName = "Body";

export default Body;