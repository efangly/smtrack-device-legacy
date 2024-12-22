import { SetMetadata } from '@nestjs/common';

// Custom Metadata Key
export const SKIP_INTERCEPTOR = 'skipInterceptor';

// Decorator Function
export const SkipInterceptor = () => SetMetadata(SKIP_INTERCEPTOR, true);
