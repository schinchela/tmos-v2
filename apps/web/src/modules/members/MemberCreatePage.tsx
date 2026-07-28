import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Contact,
  Fingerprint,
  Hash,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import type {
  FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  Button,
  ButtonLink,
} from "../../components/actions/Button";
import { InlineAlert } from "../../components/feedback/InlineAlert";
import { FormActions } from "../../components/forms/FormActions";
import { FormSection } from "../../components/forms/FormSection";
import { SelectField } from "../../components/forms/SelectField";
import { TextAreaField } from "../../components/forms/TextAreaField";
import { TextField } from "../../components/forms/TextField";
import { PageHeader } from "../../components/layout/PageHeader";
import { PageShell } from "../../components/layout/PageShell";
import { Badge } from "../../components/ui/Badge";
import { ApiClientError } from "../../lib/api/apiClient";
import type {
  CreateMemberInput,
} from "./member.types";
import { createMember } from "./members.service";

interface MemberFormState {
  memberNumber: string;
  toastmastersId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  recognitionSuffix: string;
  email: string;
  phone: string;
  membershipType: string;
  membershipStatus: string;
  joinDate: string;
  renewalDate: string;
  pathwayName: string;
  pathwayLevel: string;
  activeOfficerRole: string;
  mentorMemberId: string;
  sponsorMemberId: string;
  notes: string;
}

type MemberFormField =
  keyof MemberFormState;

type MemberFormErrors =
  Partial<
    Record<MemberFormField, string>
  >;

const initialForm: MemberFormState = {
  memberNumber: "",
  toastmastersId: "",
  firstName: "",
  lastName: "",
  displayName: "",
  recognitionSuffix: "",
  email: "",
  phone: "",
  membershipType: "Member",
  membershipStatus: "ACTIVE",
  joinDate: "",
  renewalDate: "",
  pathwayName: "",
  pathwayLevel: "0",
  activeOfficerRole: "",
  mentorMemberId: "",
  sponsorMemberId: "",
  notes: "",
};

export function MemberCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] =
    useState<MemberFormState>(
      initialForm,
    );

  const [errors, setErrors] =
    useState<MemberFormErrors>({});

  const createMutation = useMutation({
    mutationFn: createMember,
    onSuccess: async (member) => {
      queryClient.setQueryData(
        [
          "members",
          "detail",
          member.id,
        ],
        member,
      );

      await queryClient.invalidateQueries({
        queryKey: ["members"],
      });

      navigate(
        `/members/${member.id}`,
        {
          replace: true,
        },
      );
    },
  });

  const previewName = useMemo(() => {
    const explicitName =
      form.displayName.trim();

    if (explicitName) {
      return explicitName;
    }

    return [
      form.firstName.trim(),
      form.lastName.trim(),
    ]
      .filter(Boolean)
      .join(" ");
  }, [
    form.displayName,
    form.firstName,
    form.lastName,
  ]);

  function updateField(
    field: MemberFormField,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[field];

      return next;
    });

    if (createMutation.isError) {
      createMutation.reset();
    }
  }

  function validate():
    | CreateMemberInput
    | null {
    const nextErrors:
      MemberFormErrors = {};

    const firstName =
      form.firstName.trim();

    const lastName =
      form.lastName.trim();

    const email =
      form.email.trim().toLowerCase();

    if (!firstName) {
      nextErrors.firstName =
        "First name is required.";
    }

    if (!lastName) {
      nextErrors.lastName =
        "Last name is required.";
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (
      form.joinDate &&
      form.renewalDate &&
      form.renewalDate <
        form.joinDate
    ) {
      nextErrors.renewalDate =
        "Renewal date cannot be before the join date.";
    }

    const pathwayLevel = Number(
      form.pathwayLevel,
    );

    if (
      !Number.isInteger(
        pathwayLevel,
      ) ||
      pathwayLevel < 0 ||
      pathwayLevel > 5
    ) {
      nextErrors.pathwayLevel =
        "Pathway level must be between 0 and 5.";
    }

    setErrors(nextErrors);

    if (
      Object.keys(nextErrors)
        .length > 0
    ) {
      return null;
    }

    return removeEmptyValues({
      memberNumber:
        form.memberNumber.trim(),
      toastmastersId:
        form.toastmastersId.trim(),
      firstName,
      lastName,
      displayName:
        form.displayName.trim(),
      recognitionSuffix:
        form.recognitionSuffix.trim(),
      email,
      phone: form.phone.trim(),
      membershipType:
        form.membershipType.trim(),
      membershipStatus:
        form.membershipStatus,
      joinDate: form.joinDate,
      renewalDate:
        form.renewalDate,
      pathwayName:
        form.pathwayName.trim(),
      pathwayLevel,
      activeOfficerRole:
        form.activeOfficerRole.trim(),
      mentorMemberId:
        form.mentorMemberId.trim(),
      sponsorMemberId:
        form.sponsorMemberId.trim(),
      notes: form.notes.trim(),
    });
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const payload = validate();

    if (!payload) {
      return;
    }

    createMutation.mutate(payload);
  }

  const apiError =
    createMutation.error instanceof
    ApiClientError
      ? createMutation.error
      : null;

  return (
    <PageShell
      routeId="members"
      browserTitle="Add Member | Members | TMOS"
      currentBreadcrumbLabel="Add member"
    >
      <PageHeader
        title="Add a new member"
        description="Create the member's primary profile, membership standing, Toastmasters identity and education information."
        eyebrow="Member administration"
        tone="members"
        icon={
          <UserPlus className="size-4" />
        }
        backTo="/members"
        backLabel="Back to member directory"
        badge={
          <Badge
            tone="members"
            className="border border-white/20 bg-white/10 text-white"
          >
            New member
          </Badge>
        }
        actions={
          <ButtonLink
            to="/members"
            tone="members"
            variant="outline"
            leadingIcon={
              <ArrowLeft className="size-4" />
            }
          >
            Cancel
          </ButtonLink>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <HeaderSummary
            label="Profile name"
            value={
              previewName ||
              "Awaiting member name"
            }
          />

          <HeaderSummary
            label="Membership status"
            value={formatStatus(
              form.membershipStatus,
            )}
          />

          <HeaderSummary
            label="Education"
            value={
              form.pathwayName.trim()
                ? `${form.pathwayName.trim()} · Level ${form.pathwayLevel}`
                : "Not assigned"
            }
          />
        </div>
      </PageHeader>

      <form
        className="space-y-6"
        onSubmit={handleSubmit}
        noValidate
      >
        {createMutation.isError ? (
          <InlineAlert
            tone="danger"
            title="Member could not be created"
          >
            {apiError?.message ||
              "TMOS could not complete the member creation request."}

            {apiError?.requestId ? (
              <span className="mt-1 block text-xs">
                Request ID:{" "}
                {apiError.requestId}
              </span>
            ) : null}
          </InlineAlert>
        ) : null}

        <FormSection
          title="Member identity"
          description="Enter the member's legal or preferred identity as it should appear throughout TMOS."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="First name"
              value={form.firstName}
              onChange={(event) =>
                updateField(
                  "firstName",
                  event.target.value,
                )
              }
              required
              maxLength={100}
              error={errors.firstName}
              placeholder="Enter first name"
              leadingIcon={
                <User className="size-5" />
              }
            />

            <TextField
              label="Last name"
              value={form.lastName}
              onChange={(event) =>
                updateField(
                  "lastName",
                  event.target.value,
                )
              }
              required
              maxLength={100}
              error={errors.lastName}
              placeholder="Enter last name"
              leadingIcon={
                <User className="size-5" />
              }
            />

            <TextField
              label="Display name"
              value={form.displayName}
              onChange={(event) =>
                updateField(
                  "displayName",
                  event.target.value,
                )
              }
              maxLength={200}
              error={errors.displayName}
              description="Leave blank to use the first and last name."
              placeholder="Preferred display name"
              leadingIcon={
                <Contact className="size-5" />
              }
            />

            <TextField
              label="Recognition suffix"
              value={
                form.recognitionSuffix
              }
              onChange={(event) =>
                updateField(
                  "recognitionSuffix",
                  event.target.value,
                )
              }
              maxLength={100}
              error={
                errors.recognitionSuffix
              }
              placeholder="For example, DTM"
              leadingIcon={
                <Award className="size-5" />
              }
            />
          </div>
        </FormSection>

        <FormSection
          title="Membership information"
          description="Record the member's club and Toastmasters identifiers, membership classification and important dates."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <TextField
              label="Member number"
              value={form.memberNumber}
              onChange={(event) =>
                updateField(
                  "memberNumber",
                  event.target.value,
                )
              }
              maxLength={100}
              error={errors.memberNumber}
              placeholder="Club member number"
              leadingIcon={
                <Hash className="size-5" />
              }
            />

            <TextField
              label="Toastmasters ID"
              value={
                form.toastmastersId
              }
              onChange={(event) =>
                updateField(
                  "toastmastersId",
                  event.target.value,
                )
              }
              maxLength={100}
              error={
                errors.toastmastersId
              }
              placeholder="For example, PN-67953793"
              leadingIcon={
                <Fingerprint className="size-5" />
              }
            />

            <SelectField
              label="Membership type"
              value={
                form.membershipType
              }
              onChange={(event) =>
                updateField(
                  "membershipType",
                  event.target.value,
                )
              }
              leadingIcon={
                <Users className="size-5" />
              }
            >
              <option value="Member">
                Member
              </option>

              <option value="Dual Member">
                Dual Member
              </option>

              <option value="Honorary Member">
                Honorary Member
              </option>

              <option value="Prospective Member">
                Prospective Member
              </option>
            </SelectField>

            <SelectField
              label="Membership status"
              value={
                form.membershipStatus
              }
              onChange={(event) =>
                updateField(
                  "membershipStatus",
                  event.target.value,
                )
              }
              required
              leadingIcon={
                <ShieldCheck className="size-5" />
              }
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="SUSPENDED">
                Suspended
              </option>
            </SelectField>

            <TextField
              label="Join date"
              type="date"
              value={form.joinDate}
              onChange={(event) =>
                updateField(
                  "joinDate",
                  event.target.value,
                )
              }
              error={errors.joinDate}
              leadingIcon={
                <CalendarDays className="size-5" />
              }
            />

            <TextField
              label="Renewal date"
              type="date"
              value={form.renewalDate}
              onChange={(event) =>
                updateField(
                  "renewalDate",
                  event.target.value,
                )
              }
              error={
                errors.renewalDate
              }
              leadingIcon={
                <CalendarDays className="size-5" />
              }
            />
          </div>
        </FormSection>

        <FormSection
          title="Contact information"
          description="Record the contact channels used for club communication and member administration."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Email address"
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value,
                )
              }
              maxLength={254}
              error={errors.email}
              placeholder="member@example.com"
              leadingIcon={
                <Mail className="size-5" />
              }
            />

            <TextField
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value,
                )
              }
              maxLength={50}
              error={errors.phone}
              placeholder="Enter phone number"
              leadingIcon={
                <Phone className="size-5" />
              }
            />
          </div>
        </FormSection>

        <FormSection
          title="Education and leadership"
          description="Capture the member's current pathway progress and any active club responsibility."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <TextField
              label="Pathway name"
              value={form.pathwayName}
              onChange={(event) =>
                updateField(
                  "pathwayName",
                  event.target.value,
                )
              }
              maxLength={200}
              error={
                errors.pathwayName
              }
              placeholder="For example, Dynamic Leadership"
              leadingIcon={
                <Award className="size-5" />
              }
            />

            <SelectField
              label="Pathway level"
              value={
                form.pathwayLevel
              }
              onChange={(event) =>
                updateField(
                  "pathwayLevel",
                  event.target.value,
                )
              }
              error={
                errors.pathwayLevel
              }
              leadingIcon={
                <Award className="size-5" />
              }
            >
              <option value="0">
                Not started
              </option>

              <option value="1">
                Level 1
              </option>

              <option value="2">
                Level 2
              </option>

              <option value="3">
                Level 3
              </option>

              <option value="4">
                Level 4
              </option>

              <option value="5">
                Level 5
              </option>
            </SelectField>

            <TextField
              label="Active officer role"
              value={
                form.activeOfficerRole
              }
              onChange={(event) =>
                updateField(
                  "activeOfficerRole",
                  event.target.value,
                )
              }
              maxLength={200}
              error={
                errors.activeOfficerRole
              }
              placeholder="For example, President"
              leadingIcon={
                <ShieldCheck className="size-5" />
              }
            />

            <TextField
              label="Mentor member ID"
              value={
                form.mentorMemberId
              }
              onChange={(event) =>
                updateField(
                  "mentorMemberId",
                  event.target.value,
                )
              }
              maxLength={200}
              error={
                errors.mentorMemberId
              }
              description="Temporary ID entry until member selection is added."
              placeholder="Internal member ID"
              leadingIcon={
                <Users className="size-5" />
              }
            />

            <TextField
              label="Sponsor member ID"
              value={
                form.sponsorMemberId
              }
              onChange={(event) =>
                updateField(
                  "sponsorMemberId",
                  event.target.value,
                )
              }
              maxLength={200}
              error={
                errors.sponsorMemberId
              }
              description="Temporary ID entry until member selection is added."
              placeholder="Internal member ID"
              leadingIcon={
                <Users className="size-5" />
              }
            />
          </div>
        </FormSection>

        <FormSection
          title="Internal notes"
          description="Add optional information for club administrators. Notes are not shown in the member directory."
        >
          <TextAreaField
            label="Member notes"
            value={form.notes}
            onChange={(event) =>
              updateField(
                "notes",
                event.target.value,
              )
            }
            maxLength={5000}
            showCharacterCount
            error={errors.notes}
            placeholder="Add useful administrative context about this member..."
          />
        </FormSection>

        <FormActions
          message={
            createMutation.isPending
              ? "Creating the member profile…"
              : "Required fields are marked with an asterisk."
          }
          secondaryAction={
            <ButtonLink
              to="/members"
              variant="outline"
              tone="members"
            >
              Cancel
            </ButtonLink>
          }
          primaryAction={
            <Button
              type="submit"
              tone="members"
              size="lg"
              leadingIcon={
                <Save className="size-4" />
              }
              disabled={
                createMutation.isPending
              }
            >
              {createMutation.isPending
                ? "Creating member…"
                : "Create member"}
            </Button>
          }
        />
      </form>
    </PageShell>
  );
}

function removeEmptyValues(
  input: CreateMemberInput,
): CreateMemberInput {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) =>
        value !== "" &&
        value !== undefined &&
        value !== null,
    ),
  ) as CreateMemberInput;
}

function formatStatus(
  value: string,
): string {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

interface HeaderSummaryProps {
  label: string;
  value: string;
}

function HeaderSummary({
  label,
  value,
}: HeaderSummaryProps) {
  return (
    <article className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
        {label}
      </p>

      <p className="mt-2 truncate text-base font-bold text-teal-950">
        {value}
      </p>
    </article>
  );
}
