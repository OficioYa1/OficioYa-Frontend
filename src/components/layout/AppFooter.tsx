import React from 'react';
import { Heart } from 'lucide-react';
import { MascotAvatar } from '../mascot/MascotAvatar';

export const AppFooter: React.FC = () => {
  return (
    <footer style={{
      background: 'var(--color-surface)',
      width: '100%',
      borderTop: '1px solid rgba(150, 150, 150, 0.15)',
      padding: '64px 24px 32px 24px',
      marginTop: 'auto', // Pushes footer to the bottom if container is flex col with minHeight 100vh
      color: 'var(--color-text-muted)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '64px'
        }}>
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'var(--role-primary)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '18px',
                letterSpacing: '-0.5px'
              }}>
                OficioYa
              </span>
            </div>
            <p style={{
              fontSize: '15px',
              color: 'var(--color-text)',
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.4
            }}>
              Encuentra a la persona indicada para tu oficio.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
              Conectamos talento local verificado con hogares y negocios que necesitan soluciones rápidas, seguras y confiables.
            </p>
          </div>

          {/* Links: Oficio Ya */}
          <div>
            <h4 style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '14px', marginBottom: '20px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Oficio Ya
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Directorio</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Servicios</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Solicitudes</a></li>
            </ul>
          </div>

          {/* Links: Para clientes */}
          <div>
            <h4 style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '14px', marginBottom: '20px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Para clientes
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Buscar profesionales</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Publicar solicitud</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Cómo funciona</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Ayuda</a></li>
            </ul>
          </div>

          {/* Links: Para profesionales */}
          <div>
            <h4 style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '14px', marginBottom: '20px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Para profesionales
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Registrarme</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Ofrecer mis servicios</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Cómo funciona</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Centro de ayuda</a></li>
            </ul>
          </div>

          {/* Links: Información */}
          <div>
            <h4 style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '14px', marginBottom: '20px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Información
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Sobre Oficio Ya</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Seguridad</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Términos y condiciones</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Política de privacidad</a></li>
            </ul>
          </div>
        </div>

        {/* Cierre Visual "Firma" */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'var(--color-surface)',
          padding: '20px 24px',
          borderRadius: '24px',
          border: '1px solid rgba(150, 150, 150, 0.1)',
          width: 'fit-content',
          marginBottom: '48px',
        }}>
          <div style={{ width: '48px', height: '48px', flexShrink: 0, overflow: 'hidden', borderRadius: '50%', background: '#E0F2FE' }}>
            <MascotAvatar size="sm" animate="idle" forceImage="wave" />
          </div>
          <div>
            <span style={{ display: 'block', fontWeight: 800, fontSize: '16px', color: 'var(--color-text)', letterSpacing: '-0.3px', marginBottom: '2px' }}>
              ¿Necesitas una mano?
            </span>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>
              Encuentra un profesional cerca de ti.
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(150, 150, 150, 0.15)',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>© 2026 Oficio Ya</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidad</a>
            <span style={{ opacity: 0.4 }}>•</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Términos</a>
            <span style={{ opacity: 0.4 }}>•</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
