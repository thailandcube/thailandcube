import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    allowedDevOrigins: ['*.ngrok-free.app']
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
