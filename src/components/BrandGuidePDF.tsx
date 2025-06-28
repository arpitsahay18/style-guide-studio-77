
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@react-pdf/renderer';

// Register Inter font
Font.register({
  family: 'Inter',
  fonts: [
    { 
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3fwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 400
    },
    { 
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3fwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2',
      fontWeight: 500
    },
    { 
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3fwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2',
      fontWeight: 600
    },
    { 
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3fwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2',
      fontWeight: 700
    }
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 1.5,
    flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  cover: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center'
  },
  coverTitle: {
    fontSize: 42,
    fontWeight: 700,
    color: '#000000',
    marginBottom: 8
  },
  coverSubtitle: {
    fontSize: 24,
    color: '#666666',
    marginBottom: 30
  },
  coverBadge: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '8 20',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 24,
    marginTop: 32,
    color: '#000000'
  },
  subsectionTitle: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 16,
    marginTop: 24,
    color: '#000000'
  },
  colorSection: {
    marginBottom: 32
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24
  },
  colorCard: {
    width: 160,
    marginBottom: 12
  },
  colorBox: {
    width: 160,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    border: '1px solid #e5e7eb'
  },
  colorInfo: {
    fontSize: 14,
    fontWeight: 600,
    color: '#000000',
    marginBottom: 4
  },
  colorDetails: {
    fontSize: 11,
    color: '#666666',
    lineHeight: 1.4
  },
  typographySection: {
    marginBottom: 32
  },
  typographyGroup: {
    marginBottom: 24
  },
  typographyTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
    color: '#000000'
  },
  typographyPreview: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    border: '1px solid #e5e7eb'
  },
  logoSection: {
    marginBottom: 32
  },
  logoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24
  },
  logoCard: {
    width: 140,
    alignItems: 'center',
    marginBottom: 16
  },
  logoWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 8,
    border: '1px solid #e5e7eb'
  },
  logoImage: {
    width: 88,
    height: 88,
    objectFit: 'cover'
  },
  logoLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: '#666666',
    fontWeight: 500
  },
  primaryLogo: {
    width: 200,
    height: 200,
    objectFit: 'contain',
    alignSelf: 'center',
    marginBottom: 24,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 24
  }
});

interface BrandGuidePDFProps {
  guide: any;
  colorNames: Record<string, string>;
  typographyNames: Record<string, string>;
  typographyVisibility: any;
  previewText: string;
  logoBase64?: string;
}

const BrandGuidePDF: React.FC<BrandGuidePDFProps> = ({
  guide,
  colorNames,
  typographyNames,
  typographyVisibility,
  previewText,
  logoBase64
}) => {
  const backgroundColors = [
    { color: '#FFFFFF', label: 'White Background' },
    { color: '#000000', label: 'Black Background' },
    { color: '#3E3BFF', label: 'Blue Background' },
    { color: '#FFEAEA', label: 'Light Pink Background' }
  ];

  const getShapeStyles = (shape: string) => {
    switch (shape) {
      case 'rounded':
        return { borderRadius: 12 };
      case 'circle':
        return { borderRadius: 60 };
      default:
        return { borderRadius: 0 };
    }
  };

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverTitle}>{guide.name}</Text>
          <Text style={styles.coverSubtitle}>Brand Guidelines</Text>
          <View style={styles.coverBadge}>
            <Text>Made with Brand Studio</Text>
          </View>
        </View>
      </Page>

      {/* Content Pages */}
      <Page size="A4" style={styles.page}>
        {/* Typography Section */}
        <Text style={styles.sectionTitle}>Typography</Text>
        
        <View style={styles.typographySection}>
          {/* Display Typography */}
          <View style={styles.typographyGroup}>
            <Text style={styles.typographyTitle}>Display</Text>
            {typographyVisibility.display?.map((size: string) => {
              const style = guide.typography.display[size];
              if (!style) return null;
              
              return (
                <View key={size} style={styles.typographyPreview}>
                  <Text style={{
                    fontSize: parseInt(style.fontSize) * 0.75, // Scale for PDF
                    fontWeight: style.fontWeight,
                    lineHeight: parseFloat(style.lineHeight) || 1.2,
                    marginBottom: 4
                  }}>
                    {previewText}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#666666' }}>
                    {typographyNames[`display-${size}`] || `Display ${size.charAt(0).toUpperCase() + size.slice(1)}`} • 
                    {style.fontFamily.split(',')[0]} • {style.fontSize} • {style.fontWeight}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Heading Typography */}
          <View style={styles.typographyGroup}>
            <Text style={styles.typographyTitle}>Headings</Text>
            {typographyVisibility.heading?.map((level: string) => {
              const style = guide.typography.heading[level];
              if (!style) return null;
              
              return (
                <View key={level} style={styles.typographyPreview}>
                  <Text style={{
                    fontSize: parseInt(style.fontSize) * 0.75,
                    fontWeight: style.fontWeight,
                    lineHeight: parseFloat(style.lineHeight) || 1.2,
                    marginBottom: 4
                  }}>
                    {previewText}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#666666' }}>
                    {typographyNames[`heading-${level}`] || level.toUpperCase()} • 
                    {style.fontFamily.split(',')[0]} • {style.fontSize} • {style.fontWeight}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Body Typography */}
          <View style={styles.typographyGroup}>
            <Text style={styles.typographyTitle}>Body Text</Text>
            {typographyVisibility.body?.map((size: string) => {
              const style = guide.typography.body[size];
              if (!style) return null;
              
              return (
                <View key={size} style={styles.typographyPreview}>
                  <Text style={{
                    fontSize: parseInt(style.fontSize) * 0.75,
                    fontWeight: style.fontWeight,
                    lineHeight: parseFloat(style.lineHeight) || 1.2,
                    marginBottom: 4
                  }}>
                    {previewText}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#666666' }}>
                    {typographyNames[`body-${size}`] || `Body ${size.charAt(0).toUpperCase() + size.slice(1)}`} • 
                    {style.fontFamily.split(',')[0]} • {style.fontSize} • {style.fontWeight}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </Page>

      {/* Colors Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Color Palette</Text>

        {/* Primary Colors */}
        {guide.colors.primary?.length > 0 && (
          <View style={styles.colorSection}>
            <Text style={styles.subsectionTitle}>Primary Colors</Text>
            <View style={styles.colorRow}>
              {guide.colors.primary.map((color: any, index: number) => (
                <View key={index} style={styles.colorCard}>
                  <View style={[styles.colorBox, { backgroundColor: color.hex }]} />
                  <Text style={styles.colorInfo}>
                    {colorNames[`primary-${index}`] || `Primary ${index + 1}`}
                  </Text>
                  <Text style={styles.colorDetails}>
                    {color.hex.toUpperCase()}{'\n'}
                    RGB: {color.rgb}{'\n'}
                    CMYK: {color.cmyk}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Secondary Colors */}
        {guide.colors.secondary?.length > 0 && (
          <View style={styles.colorSection}>
            <Text style={styles.subsectionTitle}>Secondary Colors</Text>
            <View style={styles.colorRow}>
              {guide.colors.secondary.map((color: any, index: number) => (
                <View key={index} style={styles.colorCard}>
                  <View style={[styles.colorBox, { backgroundColor: color.hex }]} />
                  <Text style={styles.colorInfo}>
                    {colorNames[`secondary-${index}`] || `Secondary ${index + 1}`}
                  </Text>
                  <Text style={styles.colorDetails}>
                    {color.hex.toUpperCase()}{'\n'}
                    RGB: {color.rgb}{'\n'}
                    CMYK: {color.cmyk}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Neutral Colors */}
        {guide.colors.neutral?.length > 0 && (
          <View style={styles.colorSection}>
            <Text style={styles.subsectionTitle}>Neutral Colors</Text>
            <View style={styles.colorRow}>
              {guide.colors.neutral.map((color: any, index: number) => (
                <View key={index} style={styles.colorCard}>
                  <View style={[styles.colorBox, { backgroundColor: color.hex }]} />
                  <Text style={styles.colorInfo}>
                    {colorNames[`neutral-${index}`] || `Neutral ${index + 1}`}
                  </Text>
                  <Text style={styles.colorDetails}>
                    {color.hex.toUpperCase()}{'\n'}
                    RGB: {color.rgb}{'\n'}
                    CMYK: {color.cmyk}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>

      {/* Logo Page */}
      {logoBase64 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Logo</Text>
          
          {/* Primary Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.subsectionTitle}>Primary Logo</Text>
            <Image src={logoBase64} style={styles.primaryLogo} />
          </View>

          {/* Logo Variations */}
          {['square', 'rounded', 'circle'].map((shape) => (
            <View key={shape} style={styles.logoSection}>
              <Text style={styles.subsectionTitle}>
                {shape.charAt(0).toUpperCase() + shape.slice(1)} Variations
              </Text>
              <View style={styles.logoRow}>
                {backgroundColors.map((bg, index) => (
                  <View key={index} style={styles.logoCard}>
                    <View style={[
                      styles.logoWrapper,
                      { backgroundColor: bg.color },
                      getShapeStyles(shape),
                      bg.color === '#FFFFFF' ? { border: '2px solid #e5e7eb' } : {}
                    ]}>
                      <Image src={logoBase64} style={[styles.logoImage, getShapeStyles(shape)]} />
                    </View>
                    <Text style={styles.logoLabel}>{bg.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Page>
      )}
    </Document>
  );
};

export default BrandGuidePDF;
