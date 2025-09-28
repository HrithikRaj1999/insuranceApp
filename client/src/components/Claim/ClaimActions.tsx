import React from "react";
import { IconButton, Tooltip, Stack } from "@mui/material";
import { Delete, Edit, Visibility } from "@mui/icons-material";
interface Props {
  id: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  disableEdit?: boolean;
  disableDelete?: boolean;
}
const ClaimActions: React.FC<Props> = ({
  id,
  onView,
  onEdit,
  onDelete,
  disableEdit,
  disableDelete
}) => {
  return <Stack direction="row" spacing={1}>
      <Tooltip title="View">
        <IconButton size="small" onClick={() => onView(id)}>
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit">
        <span>
          <IconButton size="small" onClick={() => onEdit(id)} disabled={disableEdit}>
            <Edit fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Delete">
        <span>
          <IconButton size="small" color="error" onClick={() => onDelete(id)} disabled={disableDelete}>
            <Delete fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>;
};
export default ClaimActions;