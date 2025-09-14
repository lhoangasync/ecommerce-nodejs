export type TActiveLinkProps = {
  url: string;
  children: React.ReactNode;
};

export type TMenuItem = {
  url: string;
  title: string;
  icon?: React.ReactNode;
  onlyIcon?: boolean;
};

export type TPage = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};
