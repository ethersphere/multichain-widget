export interface MultichainTheme {
    // Common styles
    borderRadius: string
    backgroundColor: string
    textColor: string
    errorTextColor: string
    fontSize: string
    fontWeight: number
    fontFamily: string
    smallFontSize: string
    smallFontWeight: number
    secondaryTextColor: string
    // Input styles
    inputBackgroundColor: string
    inputBorderColor: string
    inputTextColor: string
    inputVerticalPadding: string
    inputHorizontalPadding: string
    // Button styles
    buttonBackgroundColor: string
    buttonTextColor: string
    buttonSecondaryBackgroundColor: string
    buttonSecondaryTextColor: string
    buttonVerticalPadding: string
    buttonHorizontalPadding: string
    // Form styles
    labelSpacing: string
}

export function getDefaultMultichainTheme(): MultichainTheme {
    return {
        // Common styles
        borderRadius: '12px',
        backgroundColor: '#121212',
        textColor: '#FFFFFF',
        errorTextColor: '#FF4D4D',
        fontSize: '16px',
        fontWeight: 700,
        fontFamily:
            "SFRounded, ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        smallFontSize: '14px',
        smallFontWeight: 500,
        secondaryTextColor: '#AAAAAA',

        // Input styles
        inputBackgroundColor: 'rgb(26, 27, 31)',
        inputBorderColor: 'rgb(26, 27, 31)',
        inputTextColor: '#FFFFFF',
        inputVerticalPadding: '12px',
        inputHorizontalPadding: '10px',
        // Button styles
        buttonBackgroundColor: '#ff7d00',
        buttonTextColor: '#FFFFFF',
        buttonSecondaryBackgroundColor: 'transparent',
        buttonSecondaryTextColor: '#ff7d00',
        buttonVerticalPadding: '12px',
        buttonHorizontalPadding: '10px',
        // Form styles
        labelSpacing: '4px'
    }
}
