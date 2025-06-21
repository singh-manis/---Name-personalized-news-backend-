import React, { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon, BellIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';

const navigation = [
  { name: 'Home', href: '/', current: true },
  { name: 'Knowledge Base', href: '/knowledge-base', current: false },
  { name: 'Analytics', href: '/analytics', current: false },
  { name: 'Recommendations', href: '/recommendations', current: false },
  { name: 'Bookmarks', href: '/bookmarks', current: false },
  { name: 'Reading History', href: '/history', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showNotifications, setShowNotifications] = useState(false);
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    loadingNotifications,
    fetchNotifications,
    markAsRead,
    setNotifications,
  } = useNotifications();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  const handleLogout = (message = 'Logged out successfully') => {
    localStorage.removeItem('token');
    toast.success(message);
    navigate('/login');
  };

  return (
    <Disclosure as="nav" className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-xl dark:bg-gray-900 dark:backdrop-blur-none dark:border-gray-800 dark:shadow dark:rounded-none fixed top-0 left-0 w-full z-50 border-b border-gray-100">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-200">
                    NewsAI
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current
                          ? 'border-primary-500 text-gray-900 dark:text-primary-200'
                          : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-primary-100',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )}
                    >
                      {t(item.name)}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {token ? (
                  <>
                    <div className="relative mr-4">
                      <button
                        className="relative focus:outline-none"
                        onClick={() => setShowNotifications((v) => !v)}
                      >
                        <BellIcon className="h-7 w-7 text-gray-400 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-200" />
                        {notifications.some(n => !n.read) && (
                          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                        )}
                      </button>
                      {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 shadow-lg rounded-md z-50 max-h-96 overflow-y-auto border border-gray-100 dark:border-gray-800">
                          <div className="p-4 border-b font-semibold text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-800">{t('Notifications')}</div>
                          {notifications.length === 0 ? (
                            <div className="p-4 text-gray-500 dark:text-gray-300">{t('No notifications')}</div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n._id}
                                className={`px-4 py-3 border-b cursor-pointer ${n.read ? 'bg-white dark:bg-gray-900' : 'bg-blue-50 dark:bg-blue-900/30 font-semibold'} border-gray-100 dark:border-gray-800`}
                                onClick={() => markAsRead(n._id)}
                              >
                                <div className="text-sm text-gray-800 dark:text-gray-100">{n.message}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-300 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <select
                      onChange={e => i18n.changeLanguage(e.target.value)}
                      value={i18n.language}
                      className="ml-4 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      style={{ minWidth: 80 }}
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी</option>
                    </select>
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                          <UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-200" aria-hidden="true" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-800">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={classNames(
                                  active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                  'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                                )}
                              >
                                {t('Your Profile')}
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleLogout()}
                                className={classNames(
                                  active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                                )}
                              >
                                {t('Sign out')}
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                    <button
                      onClick={toggleTheme}
                      className="ml-2 rounded-full p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 shadow hover:scale-110 transition-transform focus:outline-none"
                      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                      aria-label="Toggle dark mode"
                    >
                      {theme === 'dark' ? (
                        <SunIcon className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <MoonIcon className="h-6 w-6 text-gray-700" />
                      )}
                    </button>
                  </>
                ) : (
                  <div className="space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                    >
                      {t('Sign in')}
                    </Link>
                    <Link
                      to="/register"
                      className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('Sign up')}
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {token ? (
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <UserCircleIcon className="h-10 w-10 text-gray-300" />
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">User</div>
                    <div className="text-sm font-medium text-gray-500">user@example.com</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    {t('Your Profile')}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={() => handleLogout()}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    {t('Sign out')}
                  </Disclosure.Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign in
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign up
                  </Disclosure.Button>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 