import React, { useCallback, useEffect, useRef, useState } from "react"
//import { render } from "react-dom";
import TUICalendar from "@toast-ui/react-calendar"
import { ISchedule, ICalendarInfo } from "tui-calendar"
import "tui-calendar/dist/tui-calendar.css"
import "tui-date-picker/dist/tui-date-picker.css"
import "tui-time-picker/dist/tui-time-picker.css"
import Layout from "../../../components/layout/Layout"
import { Box, Button, Grid } from "@material-ui/core"
import { localRoutes, remoteRoutes } from "../../../data/constants"
import { get, put, del } from "../../../utils/ajax"
import Toast from "../../../utils/Toast"
import { useDispatch, useSelector } from "react-redux"
import { IState } from "../../../data/types"
import EventsForm from "./NewEvent"
import EditDialog from "../../../components/EditDialog"
import EventForm from "../../events/forms/EventForm"
import { eventsEdit, IEventState } from "../../../data/events/eventsReducer"
import { useHistory } from "react-router"
import { IEvent } from "../../events/types"

const start = new Date()
const end = new Date(new Date().setMinutes(start.getMinutes() + 30))

const schedule: ISchedule[] = [
	{
		category: "",
		isVisible: true,
		id: "",
		title: "",
		body: "",
		group: "",
		//location: "",
		start,
		end,
	},
]

const calendars: ICalendarInfo[] = [
	{
		id: "1",
		name: "Company",
		color: "#ffffff",
		bgColor: "#00a9ff",
		dragBgColor: "#00a9ff",
		borderColor: "#00a9ff",
	},
	{
		id: "2",
		name: "My Calendar",
		color: "#ffffff",
		bgColor: "#9e5fff",
		dragBgColor: "#9e5fff",
		borderColor: "#9e5fff",
	},
]

const CalendarEvents = () => {
	const cal = useRef(null)
	const [dialog, setShowDialog] = useState(false)
	const [updateDialog, setShowUpdateDialog] = useState(false)
	const [value, setValue] = useState<any[]>([])
	const user = useSelector((state: IState) => state.core.user)
	const [schedules, setSchedules] = useState<any[]>([])
	const { selected, data, loading }: IEventState = useSelector(
		(state: any) => state.events
	)
	console.log("xxxxxxx", data)
	const dispatch = useDispatch()
	const [eventdialog, setEventDialog] = useState<boolean>(false)
	const [selectedEvent, setSelectedEvent] = useState<IEvent>()
	const [events, setEvents] = useState<IEvent[]>([])
	const history = useHistory()

	useEffect(() => {
		get(remoteRoutes.events, (data) => {
			console.log(data)
			setEvents(data)
			let events: ISchedule[] = []

			for (let i = 0; i < data.length; i++) {
				const calEvent = {
					category: "time",
					isVisible: true,
					id: data[i].id,
					title: data[i].name,
					body: data[i].summary,
					group: data[i].group.name,
					location: data[i].venue.name,
					start: data[i].startDate,
					end: data[i].endDate,
				}
				events.push(calEvent)
			}
			setSchedules(events)
		})
	}, [])
	console.log("@@@@@@", events)
	console.log(value)
	const onBeforeCreateSchedule = useCallback((scheduleData) => {
		setValue(scheduleData)

		setShowDialog(true)
	}, [])

	const onBeforeDeleteSchedule = useCallback((res) => {
		console.log(res)

		const { id, calendarId, title } = res.schedule

		cal.current.calendarInst.deleteSchedule(id, calendarId)
		del(`${remoteRoutes.events}/${id}`, (response) => {
			Toast.success(`${title} has been deleted successfully`)
		})
	}, [])

	const onBeforeUpdateSchedule = useCallback((e) => {
		//setEventDialog(e)
		console.log(events, "wwwwww")
		setShowUpdateDialog(true)

		// const { schedule, changes } = e

		// cal.current.calendarInst.updateSchedule(
		// 	schedule.id,
		// 	schedule.calendarId,
		// 	changes
		// )
		// put(`${remoteRoutes.events}`, e, (data) => {
		// 	Toast.success("has been updated successfully")
		// })
	}, [])

	function handleNew() {
		setShowDialog(true)
	}

	function handleClose() {
		setShowDialog(false)
		setShowUpdateDialog(false)
	}

	function handleEdited(dt: any) {
		setShowUpdateDialog(false)
		dispatch(eventsEdit(dt))
	}

	return (
		<Layout>
			<Box p={2}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Button
							variant='outlined'
							color='primary'
							onClick={handleNew}
							// startIcon={<AddIcon />}
							style={{ marginLeft: 8 }}
						>
							Create Event&nbsp;&nbsp;
						</Button>

						<EditDialog open={dialog} onClose={handleClose} title='Add Event'>
							<EventsForm isNew={true} scheduleData={value} cal={cal} />
						</EditDialog>
						<EditDialog
							open={updateDialog}
							onClose={handleClose}
							title='Edit Event'
						>
							<EventForm
								data={data}
								isNew={false}
								onUpdated={handleEdited}
								onCancel={handleClose}
							/>
						</EditDialog>
					</Grid>
					<Grid item xs={12}>
						<div className='App'>
							<TUICalendar
								ref={cal}
								height='1000px'
								view='month'
								useCreationPopup={false}
								useDetailPopup={true}
								calendars={calendars}
								schedules={schedules}
								onBeforeCreateSchedule={onBeforeCreateSchedule}
								onBeforeDeleteSchedule={onBeforeDeleteSchedule}
								onBeforeUpdateSchedule={onBeforeUpdateSchedule}
							/>
						</div>
					</Grid>
				</Grid>
			</Box>
		</Layout>
	)
}

export default CalendarEvents
