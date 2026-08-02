'use client';

import { 
  Button, 
  Modal, 
  Dropdown, 
  Avatar,
  Separator, 
  useOverlayState,
  Label
} from '@heroui/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, Bars, Xmark } from '@gravity-ui/icons';
import { useEffect, useState } from 'react';
import { getUserRole } from '../actions/users';
// import { getUserRole } from '@/app/actions/users';
// import { Role } from '@prisma/client';

const menuItems = [
  { name: 'About Us', href: 'about' },
  { name: 'Resources', href: 'resources' },
  { name: 'Statistics', href: 'statistics' },
  { name: 'FAQs', href: 'faqs' },
];

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const loginModalOverlayState = useOverlayState();
  
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  const t = useTranslations('Header');
  const locale = useLocale();

  const switchLocale = (nextLocale: string) => {
    document.cookie = `locale=${nextLocale}; path=/`;
    setIsMenuOpen(false);
    router.refresh();
  };

  const handleLoginClick = () => {
    signIn('wca');
  }

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user)
      return;

    const role = session.user.role;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAdmin(role === 'SUPERUSER' || role === 'ADMIN');
    setIsSuperuser(role === 'SUPERUSER');

    // const fetchRole = async () => {
    //   try {
    //     const role = await getUserRole(Number(session.user.id));

    //     setIsAdmin(role === 'SUPERUSER' || role === 'ADMIN');
    //     setIsSuperuser(role === 'SUPERUSER');
    //   } 
    //   catch (error) {
    //     console.error('Failed to fetch user role:', error);
    //   }
    // };

    // fetchRole();
  }, [status, session]);

  return (
    <>
      <nav className='sticky top-0 bg-primary text-primary-foreground z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='shrink-0 flex items-center'>
              <Link href='/' className='flex items-center'>
                <Image src='/assets/img/thailandcube.svg' width={40} height={40} alt='ThailandCube'/>
                <p className='font-bold text-primary-foreground text-xl ml-4'>{t('thailandcube')}</p>
              </Link>
            </div>

            <div className='hidden sm:flex gap-6 items-center'>
              {menuItems.map((menu) => (
                <Link 
                  key={menu.href} 
                  href={`/${menu.href}`}
                  className={`text-sm transition-colors hover:text-gray-300 ${pathname === `/${menu.href}` ? 'font-bold underline' : ''}`}
                >
                  {t(menu.href)}
                </Link>
              ))}
            </div>

            <div className='hidden sm:flex items-center gap-4'>
              <Dropdown>
                <Button variant='secondary' size='sm'>
                  <Globe/>
                  {locale === 'th' ? 'ภาษาไทย' : 'English'}
                </Button>
                <Dropdown.Popover>
                  <Dropdown.Menu aria-label='Language switcher' onAction={(key) => switchLocale(key as string)}>
                    <Dropdown.Item id='th' textValue="ภาษาไทย">
                      <Label>ภาษาไทย</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id='en' textValue="English">
                      <Label>English</Label>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>

              {status === 'loading' ? null : session ? (
                <Dropdown>
                  <Dropdown.Trigger>
                    <Avatar
                      className='transition-transform'
                      color='accent'
                      size='md'
                    >
                      <Avatar.Image
                        alt={session?.user?.name ?? ''}
                        src={session?.user?.image ?? ''}
                      />
                      <Avatar.Fallback>{session?.user?.name ?? ''}</Avatar.Fallback>
                    </Avatar>
                  </Dropdown.Trigger>
                  <Dropdown.Popover placement='bottom end'>
                    <Dropdown.Menu aria-label='Profile Actions'>
                      <Dropdown.Item key='name' className='h-14 gap-2'>
                        <p className='font-semibold'>{session?.user?.name}</p>
                        <p className='font-semibold'>{session?.user?.email}</p>
                      </Dropdown.Item>
                      <Dropdown.Item key='profile' href='/profile'>{t('dropdown.profile')}</Dropdown.Item>
                      <Dropdown.Item key='predictions' href='/predictions'>{t('dropdown.predictions')}</Dropdown.Item>
                      {isSuperuser && (
                        <Dropdown.Item key='create-unofficial-competition' href='/new-competition'>{t('dropdown.create_new_competition')}</Dropdown.Item>
                      )}
                      {isAdmin && (
                        <Dropdown.Item key='admin' href='/admin/dashboard'>{t('dropdown.admin')}</Dropdown.Item>
                      )}
                      {isAdmin && (
                        <Dropdown.Item key='manage-predictions' href='/admin/predictions'>{t('dropdown.manage_predictions')}</Dropdown.Item>
                      )}
                      <Dropdown.Item key='logout' onPress={() => signOut()}>
                        {t('dropdown.logout')}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              ) : (
                <Button variant='secondary' onPress={() => handleLoginClick()}>
                  {t('login')}
                </Button>
              )}
            </div>
            <div className='flex items-center sm:hidden'>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='p-2 text-white-800 hover:bg-danger rounded-md transition-colors'
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <Xmark className='w-6 h-6 text-white' /> : <Bars className='w-6 h-6 text-white' />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className='sm:hidden bg-primary absolute top-full left-0 right-0 shadow-lg border-t border-blue-200 flex flex-col p-4 z-40'>
            <div className='flex flex-col gap-3'>
              {menuItems.map((menu) => (
                <Link 
                  key={menu.href} 
                  href={`/${menu.href}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-lg font-medium py-2 ${pathname === `/${menu.href}` ? 'underline' : ''}`}
                >
                  {t(menu.href)}
                </Link>
              ))}
            </div>

            <Separator className='my-4'/>

            {session ? (
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-3 mb-2'>
                  <Avatar>
                    <Avatar.Image src={session?.user?.image ?? ''}/>
                    <Avatar.Fallback>Name</Avatar.Fallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='font-bold text-sm'>{session?.user?.name}</span>
                    <span className='text-tiny text-default-500'>{session?.user?.email}</span>
                  </div>
                </div>

                <Link href='/profile' onClick={() => setIsMenuOpen(false)} className='text-lg py-2 text-white'>{t('dropdown.profile')}</Link>
                <Link href='/predictions' onClick={() => setIsMenuOpen(false)} className='text-lg py-2 text-white'>{t('dropdown.predictions')}</Link>
                
                {isSuperuser && (
                  <Link href='/new-competition' onClick={() => setIsMenuOpen(false)} className='text-lg py-2 text-white'>{t('dropdown.create_new_competition')}</Link>
                )}
                {isAdmin && (
                  <>
                    <Link href='/admin/dashboard' onClick={() => setIsMenuOpen(false)} className='text-lg py-2 text-white'>{t('dropdown.admin')}</Link>
                    <Link href='/admin/predictions' onClick={() => setIsMenuOpen(false)} className='text-lg py-2 text-white'>{t('dropdown.manage_predictions')}</Link>
                  </>
                )}
                  
                <Link href='#' onClick={() => { signOut(); setIsMenuOpen(false); }} className='text-lg text-left text-danger py-2 font-medium'>{t('dropdown.logout')}</Link>
              </div>
            ) : (
              <Button variant='secondary' fullWidth onPress={() => handleLoginClick()}>
                {t('login')}
              </Button>
            )}

            <div className='flex gap-2 mt-6'>
              <Button size='sm' variant={locale === 'th' ? 'secondary' : 'primary'} onPress={() => switchLocale('th')} className='flex-1'>
                ภาษาไทย
              </Button>
              <Button size='sm' variant={locale === 'en' ? 'secondary' : 'primary'} onPress={() => switchLocale('en')} className='flex-1'>
                English
              </Button>
            </div>
          </div>
        )}
      </nav>
      {/* <LoginModal state={loginModalOverlayState}/> */}
    </>
  );
}

function LoginModal({ state }: { state: ReturnType<typeof useOverlayState>}) {
  const t = useTranslations('Header');

  return (
    <Modal isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <Modal.Backdrop>
        <Modal.Container>
        {(onClose) => (
          <Modal.Dialog>
            <Modal.Header className='text-lg font-medium'>{t('login')}</Modal.Header>
            <Modal.Body className='mx-auto'>
              <Button variant='primary' onPress={() => signIn('wca')}>
                <Image src='/assets/wca.svg' width={30} height={30} alt='WCA' />
                {t('login_with_wca')}
              </Button>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='danger' onPress={() => state.close()}>{t('close')}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        )}
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}