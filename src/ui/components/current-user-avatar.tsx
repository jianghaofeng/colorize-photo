'use client'

import { useCurrentUserImage } from '~/hooks/use-current-user-image'
import { useCurrentUserName } from '~/hooks/use-current-user-name'
import { Avatar, AvatarFallback, AvatarImage } from '~/ui/primitives/avatar'

export const CurrentUserAvatar = () => {
  const profileImage = useCurrentUserImage()
  const name = useCurrentUserName()
  const initials = name
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase()

  return (
    <Avatar>
      {profileImage && <AvatarImage alt={initials} src={profileImage} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
