import type React from "react";
import type { FC } from "react";
import './Avatar.css'

type AvatarProps = React.ComponentProps<"div"> & {
  username: string
}

const Avatar: FC<AvatarProps> = ({ className, username, ...props }) => {
  return <div className={`avatar ${className}`} {...props}>
    {username.charAt(0).toUpperCase()}
  </div>
}

export default Avatar
