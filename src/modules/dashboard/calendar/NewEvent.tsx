import React, { useEffect, useState } from "react"
import * as yup from "yup"
import { reqDate, reqObject, reqString } from "../../../data/validations"
import { FormikHelpers } from "formik"
import Grid from "@material-ui/core/Grid"
import XForm from "../../../components/forms/XFormHC"
import XTextInput from "../../../components/inputs/XTextInput"
import { remoteRoutes } from "../../../data/constants"
import { GroupPrivacy } from "../../groups/types"
import { XRemoteSelect } from "../../../components/inputs/XRemoteSelect"
import { handleSubmission, ISubmission } from "../../../utils/formHelpers"
import { del, search } from "../../../utils/ajax"
import Toast from "../../../utils/Toast"
import { cleanComboValue } from "../../../utils/dataHelpers"
import { parseGooglePlace } from "../../../components/plain-inputs/PMapsInput"
import { XMapsInput } from "../../../components/inputs/XMapsInput"
import { IEvent } from "../../../modules/events/types"
import XDateTimeInput from "../../../components/inputs/XDateTimeInput"
import { useSelector } from "react-redux"
import { IState } from "../../../data/types"
import EventMetadataForm from "../../../modules/events/details/EventMetadataForm"

interface IProps {
	data?: Partial<IEvent>
	isNew: boolean
	onCreated?: any
	scheduleData?: any
	cal?: any
}

const schema = yup.object().shape({
	category: reqObject,
	summary: reqString,

	venue: reqObject,
	group: reqObject,

	startDate: reqDate,
	endDate: reqDate,
})

const initialData = {
	summary: "",
	privacy: GroupPrivacy.Public,
	category: null,

	venue: null,
	group: null,

	startDate: new Date(),
	endDate: new Date(),
	metaData: {},
}

const EventsForm = ({ data, isNew, onCreated, scheduleData, cal }: IProps) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [frequency, setFrequency] = useState("")
	const user = useSelector((state: IState) => state.core.user)
	const [group, setGroup] = useState<any>()
	const [event, setEvent] = useState<any>()
	console.log(scheduleData)
	useEffect(() => {
		if (event && group) {
			getFrequency(event, group)
		}
	}, [event, group])

	function getFrequency(event: any, group: any) {
		const filter = {
			eventCategory: event.id,
			groupCategory: group.categoryId,
		}
		search(remoteRoutes.groupReportFrequency, filter, (resp) => {
			setFrequency(resp[0].frequency)
		})
	}

	function handleSubmit(values: any, actions: FormikHelpers<any>) {
		const toSave: any = {
			id: values.id,
			name: `${frequency}-${values.group.categoryId}-${values.category.name}`,
			summary: values.summary,
			privacy: GroupPrivacy.Public,
			categoryId: cleanComboValue(values.category),
			parentId: values.group.parentId,

			startDate: values.startDate,
			endDate: values.endDate,

			submittedAt: new Date(),
			submittedById: user.contactId,

			venue: parseGooglePlace(values.venue),
			groupId: cleanComboValue(values.group),
			metaData: values.metaData,
		}
		const schedule = {
			id: values.id,
			title: values.category.name,
			isAllDay: scheduleData.isAllDay,
			start: values.startDate,
			end: values.endDate,
			category: scheduleData.isAllDay ? "allday" : "time",
			dueDateClass: "",
			location: scheduleData.location,
			raw: {
				class: "",
			},
			state: scheduleData.state,
		}

		cal.current.calendarInst.createSchedules([schedule])

		const submission: ISubmission = {
			url: remoteRoutes.events,
			values: toSave,
			actions,
			isNew,
			onAjaxComplete: (data: any) => {
				if (isNew) {
					onCreated && onCreated(data)
				}
				actions.resetForm()
				actions.setSubmitting(false)
			},
		}
		handleSubmission(submission)
	}

	const { placeId, name } = data?.venue || {}
	const venue = data?.venue ? { placeId, description: name } : undefined

	return (
		<XForm
			onSubmit={handleSubmit}
			schema={schema}
			initialValues={{ ...initialData, ...data, venue }}
			loading={loading}
		>
			{(formData: any) => (
				<Grid spacing={1} container>
					<Grid item xs={12} md={4}>
						<XRemoteSelect
							remote={remoteRoutes.eventsCategories}
							name='category'
							label='Category'
							variant='outlined'
							onSelect={() => setEvent(formData.category)}
						/>
					</Grid>
					<Grid item xs={12} md={8}>
						<XRemoteSelect
							remote={remoteRoutes.groupsCombo}
							name='group'
							label='Group'
							variant='outlined'
							onSelect={() => setGroup(formData.group)}
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<XDateTimeInput
							name='startDate'
							label='Start Date'
							variant='outlined'
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<XDateTimeInput
							name='endDate'
							label='End Date'
							variant='outlined'
						/>
					</Grid>
					<Grid item xs={12}>
						<XTextInput
							name='summary'
							label='Short summary'
							type='text'
							variant='outlined'
						/>
					</Grid>
					<Grid item xs={12}>
						<XMapsInput
							name='venue'
							label='Venue'
							variant='outlined'
							placeholder='Type to search'
						/>
					</Grid>
					<Grid item xs={12}>
						<EventMetadataForm
							eventCategory={cleanComboValue(formData.category)}
						/>
					</Grid>
				</Grid>
			)}
		</XForm>
	)
}

export default EventsForm
