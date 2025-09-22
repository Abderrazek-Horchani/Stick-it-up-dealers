import { classNames } from '../utils/classNames';

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export default function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  const statusStyles = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span className={classNames(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      statusStyles[status],
      className
    )}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}