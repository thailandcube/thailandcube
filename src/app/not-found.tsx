import { Link } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { CircleExclamationFill } from '@gravity-ui/icons';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] px-4 text-center'>
      <div className='flex flex-col items-center space-y-6 max-w-md'>
        <div className='p-4 bg-default-100 rounded-full flex items-center justify-center'>
           {/* <span className='text-4xl'>🚧</span> */}
        </div>
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight'>404 - Page Not Found</h1>
          <p className='text-default-500 text-lg'>
            Oops! The page you are looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
          </p>
        </div>
        <div className='flex gap-4 mt-6'>
          <Link 
            className={buttonVariants({variant: 'primary'})}
            href='/' 
          >
            Go to Homepage
          </Link>
          {/* <Link 
            className={buttonVariants({variant: 'primary'})}
            href='/search' 
          >
            Search Site
          </Link> */}
        </div>
      </div>
    </div>
  );
}